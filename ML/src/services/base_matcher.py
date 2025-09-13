import random
import math
from src.services.leagues.league_config import LEAGUE_RULES 
from src.services.leagues.league_base import get_league_scorer

K = 32  # Elo sensitivity

# ----------------- Player -----------------
class Player:
    def __init__(self, player_id, rating, group_id=None):
        self.player_id = player_id
        self.rating = rating  # Elo-style MMR
        self.group_id = group_id
        self.xp = 0

    def league(self):
        for league,rules in LEAGUE_RULES.items():
            if rules['min_xp']<=self.xp < rules['max_xp']:
                    return league
        return "standard"

    def __repr__(self):
        return f"Player({self.player_id}, rating={self.rating}, xp={self.xp}, league={self.league()})"

# ----------------- Matchmaking Queue -----------------

class MatchmakingQueue:
    def __init__(self):
        self.queue = []

    def add_player(self, player: Player):
        print(f"Added {player} to queue.")
        self.queue.append(player)

    def search_match(self, base_player, mode="1v1", max_expand=400, step=50, tolerance=100):
        while tolerance <= max_expand:
            candidates = [p for p in self.queue if p.player_id != base_player.player_id and abs(p.rating - base_player.rating) <= tolerance]
            if candidates:
                self.queue.remove(base_player)
                self.queue.remove(candidates[0])
                return (base_player, candidates[0])  # Return as tuple
            tolerance += step
        return None


# ----------------- Scoring Logic -----------------
def compute_score(player, report, plag_score, did_win):
    """
    Delegates scoring to the league-specific scorer.
    report = { "time_taken": int, "complexity_match": bool }
    plag_score = [0..1], higher = more similar
    did_win = bool
    """
    league = player.league()
    league_rules = LEAGUE_RULES[league]
    scorer = get_league_scorer(league)
    return scorer(player, report, plag_score, did_win, league_rules)

# ----------------- Elo Rating Update -----------------
def update_elo(player_a, player_b, result_a):
    Ra, Rb = player_a.rating, player_b.rating
    Pa = 1 / (1 + 10 ** ((Rb - Ra) / 400))
    Pb = 1 - Pa

    player_a.rating = round(Ra + K * (result_a - Pa))
    player_b.rating = round(Rb + K * ((1 - result_a) - Pb))

# ----------------- Example Simulation -----------------
if __name__ == "__main__":
    q = MatchmakingQueue()

    # Add players
    players = [Player(i, random.randint(120, 2100)) for i in range(1, 9)]
    for p in players:
        q.add_player(p)

    matches = []
    # Try to match all possible pairs in the queue
    while len(q.queue) > 1:
        base = q.queue[0]
        match = q.search_match(base, mode="1v1")
        if match:
            matches.append(match)
        else:
            # If no match found for this player, move to end of queue
            q.queue.append(q.queue.pop(0))
            # If after one full rotation no matches, break
            if all(q.search_match(p, mode="1v1") is None for p in q.queue):
                break

    if matches:
        for idx, (p1, p2) in enumerate(matches, 1):
            print(f"\nMatch {idx}: {p1} vs {p2}")

            # Generate dummy reports
            r1 = {"time_taken": random.randint(200, 600), "complexity_match": random.choice([True, False])}
            r2 = {"time_taken": random.randint(200, 600), "complexity_match": random.choice([True, False])}

            # Plagiarism scores
            plag1, plag2 = random.random(), random.random()

            # Compute XP (score) for both players, without knowing winner yet
            score1 = compute_score(p1, r1, plag1, did_win=None)
            score2 = compute_score(p2, r2, plag2, did_win=None)

            # Determine winner by higher XP (score)
            if score1 > score2:
                winner, loser = p1, p2
                win_score, lose_score = score1, score2
            elif score2 > score1:
                winner, loser = p2, p1
                win_score, lose_score = score2, score1
            else:
                # Tie: pick randomly
                winner, loser = random.choice([(p1, p2), (p2, p1)])
                win_score, lose_score = score1, score2

            print(f"Winner: {winner.player_id}")

            # Now update XP with did_win flag
            p1.xp = compute_score(p1, r1, plag1, did_win=(winner == p1))
            p2.xp = compute_score(p2, r2, plag2, did_win=(winner == p2))

            # Update Elo ratings based on winner
            update_elo(p1, p2, 1 if winner == p1 else 0)

            print(f"Final Results:")
            print(p1)
            print(p2)
    else:
        print("No matches found.")
