import { User } from "../models/user.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const searchUsers = AsyncHandler(async (req, res) => {
  const { query } = req.query;
  if (!query) throw new ApiError(400, "Search query is required");

  // Search by username or fullname, excluding current user
  const users = await User.find({
    $and: [
      { _id: { $ne: req.user._id } },
      {
        $or: [
          { username: { $regex: query, $options: "i" } },
          { fullname: { $regex: query, $options: "i" } }
        ]
      }
    ]
  }).select("username fullname profilePicture");

  return res.status(200).json(new ApiResponse(200, { users }, "Users searched successfully"));
});

const sendFriendRequest = AsyncHandler(async (req, res) => {
  const { friendId } = req.body;
  if (!friendId) throw new ApiError(400, "Friend ID is required");

  if (String(friendId) === String(req.user._id)) {
    throw new ApiError(400, "You cannot add yourself as a friend");
  }

  const targetUser = await User.findById(friendId);
  if (!targetUser) throw new ApiError(404, "User not found");

  // Check existing friendship
  const currentUser = await User.findById(req.user._id);
  const existingFriendship = currentUser.userFriendship.find(f => String(f.userId) === String(friendId));

  if (existingFriendship) {
    if (existingFriendship.status === 'accepted') throw new ApiError(400, "Already friends");
    if (existingFriendship.status === 'pending') {
      if (existingFriendship.isInitiator) {
        throw new ApiError(400, "Friend request already sent");
      } else {
        throw new ApiError(400, "You have a pending request from this user");
      }
    }
  }

  // Update current user's friendship list (sent)
  currentUser.userFriendship.push({ userId: friendId, status: "pending", isInitiator: true });
  await currentUser.save();

  // Update target user's friendship list (received)
  targetUser.userFriendship.push({ userId: req.user._id, status: "pending", isInitiator: false });
  await targetUser.save();

  return res.status(200).json(new ApiResponse(200, {}, "Friend request sent"));
});

const getFriendRequests = AsyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("userFriendship.userId", "username fullname profilePicture");

  // Return only RECEIVED pending requests
  const pending = user.userFriendship.filter(f => f.status === "pending" && !f.isInitiator);

  return res.status(200).json(new ApiResponse(200, { requests: pending }, "Friend requests fetched"));
});

const acceptFriendRequest = AsyncHandler(async (req, res) => {
  const { friendId } = req.body;
  if (!friendId) throw new ApiError(400, "Friend ID is required");

  const currentUser = await User.findById(req.user._id);
  const friend = await User.findById(friendId);

  if (!friend) throw new ApiError(404, "Friend not found");

  // Update current user's entry
  const fIndex = currentUser.userFriendship.findIndex(f => String(f.userId) === String(friendId));
  if (fIndex === -1) throw new ApiError(404, "Friend request not found");

  if (currentUser.userFriendship[fIndex].status === "accepted") {
    throw new ApiError(400, "Already friends");
  }

  if (currentUser.userFriendship[fIndex].isInitiator) {
    throw new ApiError(400, "You cannot accept your own friend request");
  }

  currentUser.userFriendship[fIndex].status = "accepted";
  await currentUser.save();

  // Update friend's entry
  const tIndex = friend.userFriendship.findIndex(f => String(f.userId) === String(req.user._id));
  if (tIndex !== -1) {
    friend.userFriendship[tIndex].status = "accepted";
    await friend.save();
  }

  return res.status(200).json(new ApiResponse(200, {}, "Friend request accepted"));
});

const getFriendsList = AsyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("userFriendship.userId", "username fullname profilePicture");
  const friends = user.userFriendship.filter(f => f.status === "accepted");

  return res.status(200).json(new ApiResponse(200, { friends }, "Friends list fetched"));
});

export { searchUsers, sendFriendRequest, getFriendRequests, acceptFriendRequest, getFriendsList };
