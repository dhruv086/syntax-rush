import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Problem } from './models/problem.model.js';
import { User } from './models/user.model.js';
import connectDB from './db/db.js';

dotenv.config();

const problems = [
  {
    title: "Two Sum",
    problemNumber: 1,
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    inputFormat: "First line: n (size of array), Second line: n integers, Third line: target",
    outputFormat: "Two indices separated by space",
    difficulty: "Easy",
    tags: [{ name: "array", category: "array" }],
    testCases: [
      { input: "4\n2 7 11 15\n9", output: "0 1" },
      { input: "3\n3 2 4\n6", output: "1 2" }
    ],
    timeLimitMs: 2000,
    memoryLimitKb: 256000
  },
  {
    title: "Reverse Integer",
    problemNumber: 2,
    description: "Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2^31, 2^31 - 1], then return 0.",
    inputFormat: "An integer x",
    outputFormat: "Reversed integer",
    difficulty: "Medium",
    tags: [{ name: "math", category: "math" }],
    testCases: [
      { input: "123", output: "321" },
      { input: "-123", output: "-321" },
      { input: "120", output: "21" }
    ]
  },
  {
    title: "Palindrome Number",
    problemNumber: 3,
    description: "Given an integer x, return true if x is a palindrome, and false otherwise.",
    inputFormat: "An integer x",
    outputFormat: "true or false",
    difficulty: "Easy",
    tags: [{ name: "math", category: "math" }],
    testCases: [
      { input: "121", output: "true" },
      { input: "-121", output: "false" },
      { input: "10", output: "false" }
    ]
  },
  {
    title: "Longest Common Prefix",
    problemNumber: 4,
    description: "Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string.",
    inputFormat: "First line: n (number of strings), next n lines: strings",
    outputFormat: "Longest common prefix string",
    difficulty: "Easy",
    tags: [{ name: "string", category: "string" }],
    testCases: [
      { input: "3\nflower\nflow\nflight", output: "fl" },
      { input: "3\ndog\nracecar\ncar", output: "" }
    ]
  },
  {
    title: "Valid Parentheses",
    problemNumber: 5,
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    inputFormat: "A string s",
    outputFormat: "true or false",
    difficulty: "Easy",
    tags: [{ name: "string", category: "string" }],
    testCases: [
      { input: "()", output: "true" },
      { input: "()[]{}", output: "true" },
      { input: "(]", output: "false" }
    ]
  },
  {
    title: "Merge Two Sorted Lists",
    problemNumber: 6,
    description: "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a one sorted list.",
    inputFormat: "First line: n1 (size of list1), Second line: n1 integers, Third line: n2 (size of list2), Fourth line: n2 integers",
    outputFormat: "Merged sorted list integers separated by space",
    difficulty: "Easy",
    tags: [{ name: "linked_list", category: "linked_list" }],
    testCases: [
      { input: "3\n1 2 4\n3\n1 3 4", output: "1 1 2 3 4 4" },
      { input: "0\n\n0", output: "" }
    ]
  },
  {
    title: "Remove Duplicates from Sorted Array",
    problemNumber: 7,
    description: "Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once.",
    inputFormat: "First line: n, Second line: n integers",
    outputFormat: "Number of unique elements followed by the unique elements",
    difficulty: "Easy",
    tags: [{ name: "array", category: "array" }],
    testCases: [
      { input: "3\n1 1 2", output: "2\n1 2" },
      { input: "10\n0 0 1 1 1 2 2 3 3 4", output: "5\n0 1 2 3 4" }
    ]
  },
  {
    title: "Maximum Subarray",
    problemNumber: 8,
    description: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
    inputFormat: "First line: n, Second line: n integers",
    outputFormat: "Maximum sum",
    difficulty: "Medium",
    tags: [{ name: "dynamic_programming", category: "dynamic_programming" }],
    testCases: [
      { input: "9\n-2 1 -3 4 -1 2 1 -5 4", output: "6" },
      { input: "1\n1", output: "1" },
      { input: "5\n5 4 -1 7 8", output: "23" }
    ]
  },
  {
    title: "Climbing Stairs",
    problemNumber: 9,
    description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    inputFormat: "An integer n",
    outputFormat: "Distinct ways",
    difficulty: "Easy",
    tags: [{ name: "dynamic_programming", category: "dynamic_programming" }],
    testCases: [
      { input: "2", output: "2" },
      { input: "3", output: "3" }
    ]
  },
  {
    title: "Binary Tree Inorder Traversal",
    problemNumber: 10,
    description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
    inputFormat: "Serialized binary tree in level order (e.g., [1,null,2,3])",
    outputFormat: "Inorder traversal integers separated by space",
    difficulty: "Easy",
    tags: [{ name: "graph", category: "graph" }],
    testCases: [
      { input: "1 null 2 3", output: "1 3 2" },
      { input: "", output: "" },
      { input: "1", output: "1" }
    ]
  }
];

const seed = async () => {
  try {
    await connectDB();
    console.log("Connected to database");

    let admin = await User.findOne({ position: 'admin' });
    if (!admin) {
      console.log("No admin found, creating a default admin");
      admin = await User.create({
        fullname: "System Admin",
        username: "admin",
        email: "admin@syntaxrush.com",
        password: "adminpassword123", // Will be hashed by pre-save hook
        position: "admin",
        isEmailVerified: true
      });
    }

    // Clear existing problems to avoid problemNumber conflicts or duplicates if needed
    // await Problem.deleteMany({}); 

    for (const p of problems) {
      const exists = await Problem.findOne({ problemNumber: p.problemNumber });
      if (exists) {
        console.log(`Problem ${p.problemNumber} already exists, skipping.`);
        continue;
      }
      await Problem.create({
        ...p,
        createdBy: admin._id
      });
      console.log(`Created problem: ${p.title}`);
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seed();
