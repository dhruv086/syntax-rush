/**
 * Matchmaker Utility
 * Ports the logic from ML/src/services/base_matcher.py to Node.js
 * Backed by Redis for distributed scaling
 */

import redisClient from "./redisClient.js";

const K = 32; // Elo sensitivity factor
const QUEUE_KEY = "matchmaker:queue";

class Matchmaker {
  /**
   * Adds a player to the queue
   */
  async addPlayer(socketId, user, matchType) {
    // Remove if already exists
    await this.removePlayer(user._id);

    const playerData = {
      socketId,
      user,
      matchType,
      joinedAt: Date.now(),
      currentTolerance: 100, // Initial rating difference allowed
      rating: user.performanceStats?.battlePoints || 1200 // Default rating if none
    };

    await redisClient.hSet(QUEUE_KEY, String(user._id), JSON.stringify(playerData));
    console.log(`Added ${user.username} to matchmaking queue. Type: ${matchType}`);
  }

  /**
   * Removes a player from the queue
   */
  async removePlayer(userId) {
    const deleted = await redisClient.hDel(QUEUE_KEY, String(userId));
    if (deleted > 0) {
      console.log(`Removed user ${userId} from queue.`);
    }
  }

  /**
   * Retrieves all players currently in the queue
   */
  async getQueue() {
    const queueData = await redisClient.hGetAll(QUEUE_KEY);
    return Object.values(queueData).map((data) => JSON.parse(data));
  }

  /**
   * Finds a match for a specific player or tries to pair all available players
   */
  async findMatch(queue, basePlayerId) {
    const basePlayer = queue.find((p) => String(p.user._id) === String(basePlayerId));
    
    if (!basePlayer) return null;

    // Filter potential opponents
    const candidates = queue.filter(p =>
      p.socketId !== basePlayer.socketId &&
      p.matchType === basePlayer.matchType &&
      Math.abs(p.rating - basePlayer.rating) <= basePlayer.currentTolerance
    );

    if (candidates.length > 0) {
      // Sort candidates by rating proximity or join time
      candidates.sort((a, b) => Math.abs(a.rating - basePlayer.rating) - Math.abs(b.rating - basePlayer.rating));

      const opponent = candidates[0];

      // Remove both from queue
      await this.removePlayer(basePlayer.user._id);
      await this.removePlayer(opponent.user._id);

      // Remove from the local array copy so they don't get matched again in this loop
      const bIndex = queue.findIndex(p => String(p.user._id) === String(basePlayer.user._id));
      if (bIndex > -1) queue.splice(bIndex, 1);
      const oIndex = queue.findIndex(p => String(p.user._id) === String(opponent.user._id));
      if (oIndex > -1) queue.splice(oIndex, 1);

      return [basePlayer, opponent];
    }

    return null;
  }

  /**
   * Periodically called to expand tolerance for waiting players
   */
  async expandTolerances(queue, step = 50, maxExpand = 600) {
    for (const p of queue) {
      if (p.currentTolerance < maxExpand) {
        p.currentTolerance += step;
        await redisClient.hSet(QUEUE_KEY, String(p.user._id), JSON.stringify(p));
      }
    }
  }

  /**
   * Calculates Elo rating update
   */
  static calculateEloUpdate(ra, rb, result) {
    const pa = 1 / (1 + Math.pow(10, (rb - ra) / 400));
    const newRating = Math.round(ra + K * (result - pa));
    return newRating;
  }

  /**
   * Map XP to League
   */
  static getLeague(xp) {
    if (xp >= 2100) return "Master";
    if (xp >= 1500) return "Diamond";
    if (xp >= 1000) return "Platinum";
    if (xp >= 600) return "Gold";
    if (xp >= 300) return "Silver";
    if (xp >= 120) return "Bronze";
    return "Standard";
  }
}

const matchmaker = new Matchmaker();
export default matchmaker;
