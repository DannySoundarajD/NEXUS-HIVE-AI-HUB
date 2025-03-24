'use client'

import { useState, useEffect } from 'react'
import { Editor } from '@monaco-editor/react'
import ReactMarkdown from 'react-markdown'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { db, auth } from '../firebase/config' // Using your provided config

import { 
  FaCode, 
  FaSearch, 
  FaTerminal, 
  FaLightbulb, 
  FaSpinner, 
  FaBug, 
  FaRocket,
  FaTrophy,
  FaArrowRight
} from 'react-icons/fa'

interface UserProfile {
  contact: string;
  createdAt: string;
  displayName: string;
  email: string;
  photoURL: string;
  problemsSolved: number;
  provider: string;
  uid: string;
}

interface CodeChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  language: string;  
  starterCode: string;
  testCases: { input: string; output: string; }[];
}

interface AnalysisResult {
  analysis: string;
  model: string;
  processingTime: number;
  success?: boolean;
  message?: string;
  testResults?: Array<{
    input: any;
    expected: any;
    actual: any;
    passed: boolean;
  }>;
}

// Inline challenges data
const challengesData: CodeChallenge[] = [
  {
      "id": "1",
      "title": "Problem 1: Check Even or Odd",
      "description": "Write a function that checks if a number is even or odd.",
      "difficulty": "Beginner",
      "language": "python",
      "starterCode": "def check_even_odd(n: int) -> str:\n    # Your code here\n    pass",
      "testCases": [
          {
              "input": "n = 4",
              "output": "Even"
          },
          {
              "input": "n = 7",
              "output": "Odd"
          }
      ]
  },{
    "id": "2",
    "title": "Problem 2: Find Maximum in List",
    "description": "Write a function that finds the maximum number in a given list.",
    "difficulty": "Beginner",
    "language": "python",
    "starterCode": "def find_maximum(lst: list) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "lst = [1, 5, 3, 9]",
            "output": "9"
        },
        {
            "input": "lst = [10, 20, 30]",
            "output": "30"
        }
    ]
},
{
    "id": "3",
    "title": "Problem 3: Find First Non-Repeating Character",
    "description": "Write a function that finds the first non-repeating character in a string.",
    "difficulty": "Beginner",
    "language": "python",
    "starterCode": "def first_non_repeating_char(s: str) -> str:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "s = 'programming'",
            "output": "'p'"
        },
        {
            "input": "s = 'aabbcc'",
            "output": "''"
        }
    ]
},
{
    "id": "4",
    "title": "Problem 4: Find Longest Increasing Subsequence",
    "description": "Write a function that finds the longest increasing subsequence in an array.",
    "difficulty": "Beginner",
    "language": "python",
    "starterCode": "def longest_increasing_subsequence(arr: list) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "arr = [10, 22, 9, 33, 21, 50, 41, 60]",
            "output": "5"
        },
        {
            "input": "arr = [3, 10, 2, 1, 20]",
            "output": "3"
        }
    ]
},
{
    "id": "5",
    "title": "Problem 5: Implement A* Search Algorithm",
    "description": "Write a function that implements the A* search algorithm to find the shortest path in a graph.",
    "difficulty": "Beginner",
    "language": "python",
    "starterCode": "def a_star_search(graph: dict, start: str, goal: str) -> list:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "graph = {...}, start = 'A', goal = 'G'",
            "output": "['A', 'C', 'G']"
        }
    ]
},
{
    "id": "6",
    "title": "Problem 6: Find Two Numbers That Sum to Target",
    "description": "Write a function that finds two numbers in an array that add up to a given target.",
    "difficulty": "Beginner",
    "language": "python",
    "starterCode": "def two_sum(nums: list, target: int) -> list:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "nums = [1,2,3,4], target = 5",
            "output": "[0,3]"
        },
        {
            "input": "nums = [10,20,30], target = 50",
            "output": "[1,2]"
        }
    ]
},
{
    "id": "7",
    "title": "Problem 7: Sum of Two Numbers",
    "description": "Write a function that takes two integers as input and returns their sum.",
    "difficulty": "Beginner",
    "language": "python",
    "starterCode": "def sum_two_numbers(a: int, b: int) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "a = 2, b = 3",
            "output": "5"
        },
        {
            "input": "a = 10, b = 20",
            "output": "30"
        }
    ]
},
{
    "id": "8",
    "title": "Problem 8: Check Even or Odd",
    "description": "Write a function that checks if a number is even or odd.",
    "difficulty": "Beginner",
    "language": "python",
    "starterCode": "def check_even_odd(n: int) -> str:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "n = 4",
            "output": "Even"
        },
        {
            "input": "n = 7",
            "output": "Odd"
        }
    ]
},
{
    "id": "9",
    "title": "Problem 9: Find Maximum in List",
    "description": "Write a function that finds the maximum number in a given list.",
    "difficulty": "Beginner",
    "language": "python",
    "starterCode": "def find_maximum(lst: list) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "lst = [1, 5, 3, 9]",
            "output": "9"
        },
        {
            "input": "lst = [10, 20, 30]",
            "output": "30"
        }
    ]
},
{
    "id": "10",
    "title": "Problem 10: Find First Non-Repeating Character",
    "description": "Write a function that finds the first non-repeating character in a string.",
    "difficulty": "Beginner",
    "language": "python",
    "starterCode": "def first_non_repeating_char(s: str) -> str:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "s = 'programming'",
            "output": "'p'"
        },
        {
            "input": "s = 'aabbcc'",
            "output": "''"
        }
    ]
},
{
    "id": "11",
    "title": "Problem 11: Find Longest Increasing Subsequence",
    "description": "Write a function that finds the longest increasing subsequence in an array.",
    "difficulty": "Medium",
    "language": "python",
    "starterCode": "def longest_increasing_subsequence(arr: list) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "arr = [10, 22, 9, 33, 21, 50, 41, 60]",
            "output": "5"
        },
        {
            "input": "arr = [3, 10, 2, 1, 20]",
            "output": "3"
        }
    ]
},
{
    "id": "12",
    "title": "Problem 12: Implement A* Search Algorithm",
    "description": "Write a function that implements the A* search algorithm to find the shortest path in a graph.",
    "difficulty": "Medium",
    "language": "python",
    "starterCode": "def a_star_search(graph: dict, start: str, goal: str) -> list:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "graph = {...}, start = 'A', goal = 'G'",
            "output": "['A', 'C', 'G']"
        }
    ]
},
{
    "id": "13",
    "title": "Problem 13: Find Two Numbers That Sum to Target",
    "description": "Write a function that finds two numbers in an array that add up to a given target.",
    "difficulty": "Medium",
    "language": "python",
    "starterCode": "def two_sum(nums: list, target: int) -> list:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "nums = [1,2,3,4], target = 5",
            "output": "[0,3]"
        },
        {
            "input": "nums = [10,20,30], target = 50",
            "output": "[1,2]"
        }
    ]
},
{
    "id": "14",
    "title": "Problem 14: Sum of Two Numbers",
    "description": "Write a function that takes two integers as input and returns their sum.",
    "difficulty": "Medium",
    "language": "python",
    "starterCode": "def sum_two_numbers(a: int, b: int) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "a = 2, b = 3",
            "output": "5"
        },
        {
            "input": "a = 10, b = 20",
            "output": "30"
        }
    ]
},
{
    "id": "15",
    "title": "Problem 15: Check Even or Odd",
    "description": "Write a function that checks if a number is even or odd.",
    "difficulty": "Medium",
    "language": "python",
    "starterCode": "def check_even_odd(n: int) -> str:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "n = 4",
            "output": "Even"
        },
        {
            "input": "n = 7",
            "output": "Odd"
        }
    ]
},
{
    "id": "16",
    "title": "Problem 16: Find Maximum in List",
    "description": "Write a function that finds the maximum number in a given list.",
    "difficulty": "Medium",
    "language": "python",
    "starterCode": "def find_maximum(lst: list) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "lst = [1, 5, 3, 9]",
            "output": "9"
        },
        {
            "input": "lst = [10, 20, 30]",
            "output": "30"
        }
    ]
},
{
    "id": "17",
    "title": "Problem 17: Find First Non-Repeating Character",
    "description": "Write a function that finds the first non-repeating character in a string.",
    "difficulty": "Medium",
    "language": "python",
    "starterCode": "def first_non_repeating_char(s: str) -> str:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "s = 'programming'",
            "output": "'p'"
        },
        {
            "input": "s = 'aabbcc'",
            "output": "''"
        }
    ]
},
{
    "id": "18",
    "title": "Problem 18: Find Longest Increasing Subsequence",
    "description": "Write a function that finds the longest increasing subsequence in an array.",
    "difficulty": "Medium",
    "language": "python",
    "starterCode": "def longest_increasing_subsequence(arr: list) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "arr = [10, 22, 9, 33, 21, 50, 41, 60]",
            "output": "5"
        },
        {
            "input": "arr = [3, 10, 2, 1, 20]",
            "output": "3"
        }
    ]
},
{
    "id": "19",
    "title": "Problem 19: Implement A* Search Algorithm",
    "description": "Write a function that implements the A* search algorithm to find the shortest path in a graph.",
    "difficulty": "Medium",
    "language": "python",
    "starterCode": "def a_star_search(graph: dict, start: str, goal: str) -> list:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "graph = {...}, start = 'A', goal = 'G'",
            "output": "['A', 'C', 'G']"
        }
    ]
},
{
    "id": "20",
    "title": "Problem 20: Find Two Numbers That Sum to Target",
    "description": "Write a function that finds two numbers in an array that add up to a given target.",
    "difficulty": "Medium",
    "language": "python",
    "starterCode": "def two_sum(nums: list, target: int) -> list:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "nums = [1,2,3,4], target = 5",
            "output": "[0,3]"
        },
        {
            "input": "nums = [10,20,30], target = 50",
            "output": "[1,2]"
        }
    ]
},
{
    "id": "21",
    "title": "Problem 21: Sum of Two Numbers",
    "description": "Write a function that takes two integers as input and returns their sum.",
    "difficulty": "Medium",
    "language": "python",
    "starterCode": "def sum_two_numbers(a: int, b: int) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "a = 2, b = 3",
            "output": "5"
        },
        {
            "input": "a = 10, b = 20",
            "output": "30"
        }
    ]
},
{
    "id": "22",
    "title": "Problem 22: Check Even or Odd",
    "description": "Write a function that checks if a number is even or odd.",
    "difficulty": "Medium",
    "language": "python",
    "starterCode": "def check_even_odd(n: int) -> str:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "n = 4",
            "output": "Even"
        },
        {
            "input": "n = 7",
            "output": "Odd"
        }
    ]
},
{
    "id": "23",
    "title": "Problem 23: Find Maximum in List",
    "description": "Write a function that finds the maximum number in a given list.",
    "difficulty": "Medium",
    "language": "python",
    "starterCode": "def find_maximum(lst: list) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "lst = [1, 5, 3, 9]",
            "output": "9"
        },
        {
            "input": "lst = [10, 20, 30]",
            "output": "30"
        }
    ]
},
{
    "id": "24",
    "title": "Problem 24: Find First Non-Repeating Character",
    "description": "Write a function that finds the first non-repeating character in a string.",
    "difficulty": "Medium",
    "language": "python",
    "starterCode": "def first_non_repeating_char(s: str) -> str:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "s = 'programming'",
            "output": "'p'"
        },
        {
            "input": "s = 'aabbcc'",
            "output": "''"
        }
    ]
},
{
    "id": "25",
    "title": "Problem 25: Find Longest Increasing Subsequence",
    "description": "Write a function that finds the longest increasing subsequence in an array.",
    "difficulty": "Medium",
    "language": "python",
    "starterCode": "def longest_increasing_subsequence(arr: list) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "arr = [10, 22, 9, 33, 21, 50, 41, 60]",
            "output": "5"
        },
        {
            "input": "arr = [3, 10, 2, 1, 20]",
            "output": "3"
        }
    ]
},
{
    "id": "26",
    "title": "Problem 26: Implement A* Search Algorithm",
    "description": "Write a function that implements the A* search algorithm to find the shortest path in a graph.",
    "difficulty": "Intermediate",
    "language": "python",
    "starterCode": "def a_star_search(graph: dict, start: str, goal: str) -> list:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "graph = {...}, start = 'A', goal = 'G'",
            "output": "['A', 'C', 'G']"
        }
    ]
},
{
    "id": "27",
    "title": "Problem 27: Find Two Numbers That Sum to Target",
    "description": "Write a function that finds two numbers in an array that add up to a given target.",
    "difficulty": "Intermediate",
    "language": "python",
    "starterCode": "def two_sum(nums: list, target: int) -> list:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "nums = [1,2,3,4], target = 5",
            "output": "[0,3]"
        },
        {
            "input": "nums = [10,20,30], target = 50",
            "output": "[1,2]"
        }
    ]
},
{
    "id": "28",
    "title": "Problem 28: Sum of Two Numbers",
    "description": "Write a function that takes two integers as input and returns their sum.",
    "difficulty": "Intermediate",
    "language": "python",
    "starterCode": "def sum_two_numbers(a: int, b: int) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "a = 2, b = 3",
            "output": "5"
        },
        {
            "input": "a = 10, b = 20",
            "output": "30"
        }
    ]
},
{
    "id": "29",
    "title": "Problem 29: Check Even or Odd",
    "description": "Write a function that checks if a number is even or odd.",
    "difficulty": "Intermediate",
    "language": "python",
    "starterCode": "def check_even_odd(n: int) -> str:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "n = 4",
            "output": "Even"
        },
        {
            "input": "n = 7",
            "output": "Odd"
        }
    ]
},
{
    "id": "30",
    "title": "Problem 30: Find Maximum in List",
    "description": "Write a function that finds the maximum number in a given list.",
    "difficulty": "Intermediate",
    "language": "python",
    "starterCode": "def find_maximum(lst: list) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "lst = [1, 5, 3, 9]",
            "output": "9"
        },
        {
            "input": "lst = [10, 20, 30]",
            "output": "30"
        }
    ]
},
{
    "id": "31",
    "title": "Problem 31: Find First Non-Repeating Character",
    "description": "Write a function that finds the first non-repeating character in a string.",
    "difficulty": "Intermediate",
    "language": "python",
    "starterCode": "def first_non_repeating_char(s: str) -> str:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "s = 'programming'",
            "output": "'p'"
        },
        {
            "input": "s = 'aabbcc'",
            "output": "''"
        }
    ]
},
{
    "id": "32",
    "title": "Problem 32: Find Longest Increasing Subsequence",
    "description": "Write a function that finds the longest increasing subsequence in an array.",
    "difficulty": "Intermediate",
    "language": "python",
    "starterCode": "def longest_increasing_subsequence(arr: list) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "arr = [10, 22, 9, 33, 21, 50, 41, 60]",
            "output": "5"
        },
        {
            "input": "arr = [3, 10, 2, 1, 20]",
            "output": "3"
        }
    ]
},
{
    "id": "33",
    "title": "Problem 33: Implement A* Search Algorithm",
    "description": "Write a function that implements the A* search algorithm to find the shortest path in a graph.",
    "difficulty": "Intermediate",
    "language": "python",
    "starterCode": "def a_star_search(graph: dict, start: str, goal: str) -> list:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "graph = {...}, start = 'A', goal = 'G'",
            "output": "['A', 'C', 'G']"
        }
    ]
},
{
    "id": "34",
    "title": "Problem 34: Find Two Numbers That Sum to Target",
    "description": "Write a function that finds two numbers in an array that add up to a given target.",
    "difficulty": "Intermediate",
    "language": "python",
    "starterCode": "def two_sum(nums: list, target: int) -> list:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "nums = [1,2,3,4], target = 5",
            "output": "[0,3]"
        },
        {
            "input": "nums = [10,20,30], target = 50",
            "output": "[1,2]"
        }
    ]
},
{
    "id": "35",
    "title": "Problem 35: Sum of Two Numbers",
    "description": "Write a function that takes two integers as input and returns their sum.",
    "difficulty": "Intermediate",
    "language": "python",
    "starterCode": "def sum_two_numbers(a: int, b: int) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "a = 2, b = 3",
            "output": "5"
        },
        {
            "input": "a = 10, b = 20",
            "output": "30"
        }
    ]
},
{
    "id": "36",
    "title": "Problem 36: Check Even or Odd",
    "description": "Write a function that checks if a number is even or odd.",
    "difficulty": "Intermediate",
    "language": "python",
    "starterCode": "def check_even_odd(n: int) -> str:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "n = 4",
            "output": "Even"
        },
        {
            "input": "n = 7",
            "output": "Odd"
        }
    ]
},
{
    "id": "37",
    "title": "Problem 37: Find Maximum in List",
    "description": "Write a function that finds the maximum number in a given list.",
    "difficulty": "Intermediate",
    "language": "python",
    "starterCode": "def find_maximum(lst: list) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "lst = [1, 5, 3, 9]",
            "output": "9"
        },
        {
            "input": "lst = [10, 20, 30]",
            "output": "30"
        }
    ]
},
{
    "id": "38",
    "title": "Problem 38: Find First Non-Repeating Character",
    "description": "Write a function that finds the first non-repeating character in a string.",
    "difficulty": "Intermediate",
    "language": "python",
    "starterCode": "def first_non_repeating_char(s: str) -> str:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "s = 'programming'",
            "output": "'p'"
        },
        {
            "input": "s = 'aabbcc'",
            "output": "''"
        }
    ]
},
{
    "id": "39",
    "title": "Problem 39: Find Longest Increasing Subsequence",
    "description": "Write a function that finds the longest increasing subsequence in an array.",
    "difficulty": "Intermediate",
    "language": "python",
    "starterCode": "def longest_increasing_subsequence(arr: list) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "arr = [10, 22, 9, 33, 21, 50, 41, 60]",
            "output": "5"
        },
        {
            "input": "arr = [3, 10, 2, 1, 20]",
            "output": "3"
        }
    ]
},
{
    "id": "40",
    "title": "Problem 40: Implement A* Search Algorithm",
    "description": "Write a function that implements the A* search algorithm to find the shortest path in a graph.",
    "difficulty": "Intermediate",
    "language": "python",
    "starterCode": "def a_star_search(graph: dict, start: str, goal: str) -> list:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "graph = {...}, start = 'A', goal = 'G'",
            "output": "['A', 'C', 'G']"
        }
    ]
},
{
    "id": "41",
    "title": "Problem 41: Find Two Numbers That Sum to Target",
    "description": "Write a function that finds two numbers in an array that add up to a given target.",
    "difficulty": "Intermediate",
    "language": "python",
    "starterCode": "def two_sum(nums: list, target: int) -> list:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "nums = [1,2,3,4], target = 5",
            "output": "[0,3]"
        },
        {
            "input": "nums = [10,20,30], target = 50",
            "output": "[1,2]"
        }
    ]
},
{
    "id": "42",
    "title": "Problem 42: Sum of Two Numbers",
    "description": "Write a function that takes two integers as input and returns their sum.",
    "difficulty": "Intermediate",
    "language": "python",
    "starterCode": "def sum_two_numbers(a: int, b: int) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "a = 2, b = 3",
            "output": "5"
        },
        {
            "input": "a = 10, b = 20",
            "output": "30"
        }
    ]
},
{
    "id": "43",
    "title": "Problem 43: Check Even or Odd",
    "description": "Write a function that checks if a number is even or odd.",
    "difficulty": "Intermediate",
    "language": "python",
    "starterCode": "def check_even_odd(n: int) -> str:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "n = 4",
            "output": "Even"
        },
        {
            "input": "n = 7",
            "output": "Odd"
        }
    ]
},
{
    "id": "44",
    "title": "Problem 44: Find Maximum in List",
    "description": "Write a function that finds the maximum number in a given list.",
    "difficulty": "Intermediate",
    "language": "python",
    "starterCode": "def find_maximum(lst: list) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "lst = [1, 5, 3, 9]",
            "output": "9"
        },
        {
            "input": "lst = [10, 20, 30]",
            "output": "30"
        }
    ]
},
{
    "id": "45",
    "title": "Problem 45: Find First Non-Repeating Character",
    "description": "Write a function that finds the first non-repeating character in a string.",
    "difficulty": "Intermediate",
    "language": "python",
    "starterCode": "def first_non_repeating_char(s: str) -> str:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "s = 'programming'",
            "output": "'p'"
        },
        {
            "input": "s = 'aabbcc'",
            "output": "''"
        }
    ]
},
{
    "id": "46",
    "title": "Problem 46: Find Longest Increasing Subsequence",
    "description": "Write a function that finds the longest increasing subsequence in an array.",
    "difficulty": "Intermediate",
    "language": "python",
    "starterCode": "def longest_increasing_subsequence(arr: list) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "arr = [10, 22, 9, 33, 21, 50, 41, 60]",
            "output": "5"
        },
        {
            "input": "arr = [3, 10, 2, 1, 20]",
            "output": "3"
        }
    ]
},
{
    "id": "47",
    "title": "Problem 47: Implement A* Search Algorithm",
    "description": "Write a function that implements the A* search algorithm to find the shortest path in a graph.",
    "difficulty": "Intermediate",
    "language": "python",
    "starterCode": "def a_star_search(graph: dict, start: str, goal: str) -> list:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "graph = {...}, start = 'A', goal = 'G'",
            "output": "['A', 'C', 'G']"
        }
    ]
},
{
    "id": "48",
    "title": "Problem 48: Find Two Numbers That Sum to Target",
    "description": "Write a function that finds two numbers in an array that add up to a given target.",
    "difficulty": "Intermediate",
    "language": "python",
    "starterCode": "def two_sum(nums: list, target: int) -> list:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "nums = [1,2,3,4], target = 5",
            "output": "[0,3]"
        },
        {
            "input": "nums = [10,20,30], target = 50",
            "output": "[1,2]"
        }
    ]
},
{
    "id": "49",
    "title": "Problem 49: Sum of Two Numbers",
    "description": "Write a function that takes two integers as input and returns their sum.",
    "difficulty": "Intermediate",
    "language": "python",
    "starterCode": "def sum_two_numbers(a: int, b: int) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "a = 2, b = 3",
            "output": "5"
        },
        {
            "input": "a = 10, b = 20",
            "output": "30"
        }
    ]
},
{
    "id": "50",
    "title": "Problem 50: Check Even or Odd",
    "description": "Write a function that checks if a number is even or odd.",
    "difficulty": "Intermediate",
    "language": "python",
    "starterCode": "def check_even_odd(n: int) -> str:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "n = 4",
            "output": "Even"
        },
        {
            "input": "n = 7",
            "output": "Odd"
        }
    ]
},
{
    "id": "51",
    "title": "Problem 51: Find Maximum in List",
    "description": "Write a function that finds the maximum number in a given list.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def find_maximum(lst: list) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "lst = [1, 5, 3, 9]",
            "output": "9"
        },
        {
            "input": "lst = [10, 20, 30]",
            "output": "30"
        }
    ]
},
{
    "id": "52",
    "title": "Problem 52: Find First Non-Repeating Character",
    "description": "Write a function that finds the first non-repeating character in a string.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def first_non_repeating_char(s: str) -> str:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "s = 'programming'",
            "output": "'p'"
        },
        {
            "input": "s = 'aabbcc'",
            "output": "''"
        }
    ]
},
{
    "id": "53",
    "title": "Problem 53: Find Longest Increasing Subsequence",
    "description": "Write a function that finds the longest increasing subsequence in an array.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def longest_increasing_subsequence(arr: list) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "arr = [10, 22, 9, 33, 21, 50, 41, 60]",
            "output": "5"
        },
        {
            "input": "arr = [3, 10, 2, 1, 20]",
            "output": "3"
        }
    ]
},
{
    "id": "54",
    "title": "Problem 54: Implement A* Search Algorithm",
    "description": "Write a function that implements the A* search algorithm to find the shortest path in a graph.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def a_star_search(graph: dict, start: str, goal: str) -> list:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "graph = {...}, start = 'A', goal = 'G'",
            "output": "['A', 'C', 'G']"
        }
    ]
},
{
    "id": "55",
    "title": "Problem 55: Find Two Numbers That Sum to Target",
    "description": "Write a function that finds two numbers in an array that add up to a given target.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def two_sum(nums: list, target: int) -> list:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "nums = [1,2,3,4], target = 5",
            "output": "[0,3]"
        },
        {
            "input": "nums = [10,20,30], target = 50",
            "output": "[1,2]"
        }
    ]
},
{
    "id": "56",
    "title": "Problem 56: Sum of Two Numbers",
    "description": "Write a function that takes two integers as input and returns their sum.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def sum_two_numbers(a: int, b: int) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "a = 2, b = 3",
            "output": "5"
        },
        {
            "input": "a = 10, b = 20",
            "output": "30"
        }
    ]
},
{
    "id": "57",
    "title": "Problem 57: Check Even or Odd",
    "description": "Write a function that checks if a number is even or odd.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def check_even_odd(n: int) -> str:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "n = 4",
            "output": "Even"
        },
        {
            "input": "n = 7",
            "output": "Odd"
        }
    ]
},
{
    "id": "58",
    "title": "Problem 58: Find Maximum in List",
    "description": "Write a function that finds the maximum number in a given list.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def find_maximum(lst: list) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "lst = [1, 5, 3, 9]",
            "output": "9"
        },
        {
            "input": "lst = [10, 20, 30]",
            "output": "30"
        }
    ]
},
{
    "id": "59",
    "title": "Problem 59: Find First Non-Repeating Character",
    "description": "Write a function that finds the first non-repeating character in a string.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def first_non_repeating_char(s: str) -> str:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "s = 'programming'",
            "output": "'p'"
        },
        {
            "input": "s = 'aabbcc'",
            "output": "''"
        }
    ]
},
{
    "id": "60",
    "title": "Problem 60: Find Longest Increasing Subsequence",
    "description": "Write a function that finds the longest increasing subsequence in an array.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def longest_increasing_subsequence(arr: list) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "arr = [10, 22, 9, 33, 21, 50, 41, 60]",
            "output": "5"
        },
        {
            "input": "arr = [3, 10, 2, 1, 20]",
            "output": "3"
        }
    ]
},
{
    "id": "61",
    "title": "Problem 61: Implement A* Search Algorithm",
    "description": "Write a function that implements the A* search algorithm to find the shortest path in a graph.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def a_star_search(graph: dict, start: str, goal: str) -> list:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "graph = {...}, start = 'A', goal = 'G'",
            "output": "['A', 'C', 'G']"
        }
    ]
},
{
    "id": "62",
    "title": "Problem 62: Find Two Numbers That Sum to Target",
    "description": "Write a function that finds two numbers in an array that add up to a given target.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def two_sum(nums: list, target: int) -> list:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "nums = [1,2,3,4], target = 5",
            "output": "[0,3]"
        },
        {
            "input": "nums = [10,20,30], target = 50",
            "output": "[1,2]"
        }
    ]
},
{
    "id": "63",
    "title": "Problem 63: Sum of Two Numbers",
    "description": "Write a function that takes two integers as input and returns their sum.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def sum_two_numbers(a: int, b: int) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "a = 2, b = 3",
            "output": "5"
        },
        {
            "input": "a = 10, b = 20",
            "output": "30"
        }
    ]
},
{
    "id": "64",
    "title": "Problem 64: Check Even or Odd",
    "description": "Write a function that checks if a number is even or odd.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def check_even_odd(n: int) -> str:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "n = 4",
            "output": "Even"
        },
        {
            "input": "n = 7",
            "output": "Odd"
        }
    ]
},
{
    "id": "65",
    "title": "Problem 65: Find Maximum in List",
    "description": "Write a function that finds the maximum number in a given list.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def find_maximum(lst: list) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "lst = [1, 5, 3, 9]",
            "output": "9"
        },
        {
            "input": "lst = [10, 20, 30]",
            "output": "30"
        }
    ]
},
{
    "id": "66",
    "title": "Problem 66: Find First Non-Repeating Character",
    "description": "Write a function that finds the first non-repeating character in a string.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def first_non_repeating_char(s: str) -> str:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "s = 'programming'",
            "output": "'p'"
        },
        {
            "input": "s = 'aabbcc'",
            "output": "''"
        }
    ]
},
{
    "id": "67",
    "title": "Problem 67: Find Longest Increasing Subsequence",
    "description": "Write a function that finds the longest increasing subsequence in an array.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def longest_increasing_subsequence(arr: list) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "arr = [10, 22, 9, 33, 21, 50, 41, 60]",
            "output": "5"
        },
        {
            "input": "arr = [3, 10, 2, 1, 20]",
            "output": "3"
        }
    ]
},
{
    "id": "68",
    "title": "Problem 68: Implement A* Search Algorithm",
    "description": "Write a function that implements the A* search algorithm to find the shortest path in a graph.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def a_star_search(graph: dict, start: str, goal: str) -> list:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "graph = {...}, start = 'A', goal = 'G'",
            "output": "['A', 'C', 'G']"
        }
    ]
},
{
    "id": "69",
    "title": "Problem 69: Find Two Numbers That Sum to Target",
    "description": "Write a function that finds two numbers in an array that add up to a given target.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def two_sum(nums: list, target: int) -> list:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "nums = [1,2,3,4], target = 5",
            "output": "[0,3]"
        },
        {
            "input": "nums = [10,20,30], target = 50",
            "output": "[1,2]"
        }
    ]
},
{
    "id": "70",
    "title": "Problem 70: Sum of Two Numbers",
    "description": "Write a function that takes two integers as input and returns their sum.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def sum_two_numbers(a: int, b: int) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "a = 2, b = 3",
            "output": "5"
        },
        {
            "input": "a = 10, b = 20",
            "output": "30"
        }
    ]
},
{
    "id": "71",
    "title": "Problem 71: Check Even or Odd",
    "description": "Write a function that checks if a number is even or odd.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def check_even_odd(n: int) -> str:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "n = 4",
            "output": "Even"
        },
        {
            "input": "n = 7",
            "output": "Odd"
        }
    ]
},
{
    "id": "72",
    "title": "Problem 72: Find Maximum in List",
    "description": "Write a function that finds the maximum number in a given list.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def find_maximum(lst: list) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "lst = [1, 5, 3, 9]",
            "output": "9"
        },
        {
            "input": "lst = [10, 20, 30]",
            "output": "30"
        }
    ]
},
{
    "id": "73",
    "title": "Problem 73: Find First Non-Repeating Character",
    "description": "Write a function that finds the first non-repeating character in a string.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def first_non_repeating_char(s: str) -> str:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "s = 'programming'",
            "output": "'p'"
        },
        {
            "input": "s = 'aabbcc'",
            "output": "''"
        }
    ]
},
{
    "id": "74",
    "title": "Problem 74: Find Longest Increasing Subsequence",
    "description": "Write a function that finds the longest increasing subsequence in an array.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def longest_increasing_subsequence(arr: list) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "arr = [10, 22, 9, 33, 21, 50, 41, 60]",
            "output": "5"
        },
        {
            "input": "arr = [3, 10, 2, 1, 20]",
            "output": "3"
        }
    ]
},
{
    "id": "75",
    "title": "Problem 75: Implement A* Search Algorithm",
    "description": "Write a function that implements the A* search algorithm to find the shortest path in a graph.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def a_star_search(graph: dict, start: str, goal: str) -> list:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "graph = {...}, start = 'A', goal = 'G'",
            "output": "['A', 'C', 'G']"
        }
    ]
},
{
    "id": "76",
    "title": "Problem 76: Find Two Numbers That Sum to Target",
    "description": "Write a function that finds two numbers in an array that add up to a given target.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def two_sum(nums: list, target: int) -> list:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "nums = [1,2,3,4], target = 5",
            "output": "[0,3]"
        },
        {
            "input": "nums = [10,20,30], target = 50",
            "output": "[1,2]"
        }
    ]
},
{
    "id": "77",
    "title": "Problem 77: Sum of Two Numbers",
    "description": "Write a function that takes two integers as input and returns their sum.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def sum_two_numbers(a: int, b: int) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "a = 2, b = 3",
            "output": "5"
        },
        {
            "input": "a = 10, b = 20",
            "output": "30"
        }
    ]
},
{
    "id": "78",
    "title": "Problem 78: Check Even or Odd",
    "description": "Write a function that checks if a number is even or odd.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def check_even_odd(n: int) -> str:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "n = 4",
            "output": "Even"
        },
        {
            "input": "n = 7",
            "output": "Odd"
        }
    ]
},
{
    "id": "79",
    "title": "Problem 79: Find Maximum in List",
    "description": "Write a function that finds the maximum number in a given list.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def find_maximum(lst: list) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "lst = [1, 5, 3, 9]",
            "output": "9"
        },
        {
            "input": "lst = [10, 20, 30]",
            "output": "30"
        }
    ]
},
{
    "id": "80",
    "title": "Problem 80: Find First Non-Repeating Character",
    "description": "Write a function that finds the first non-repeating character in a string.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def first_non_repeating_char(s: str) -> str:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "s = 'programming'",
            "output": "'p'"
        },
        {
            "input": "s = 'aabbcc'",
            "output": "''"
        }
    ]
},
{
    "id": "81",
    "title": "Problem 81: Find Longest Increasing Subsequence",
    "description": "Write a function that finds the longest increasing subsequence in an array.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def longest_increasing_subsequence(arr: list) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "arr = [10, 22, 9, 33, 21, 50, 41, 60]",
            "output": "5"
        },
        {
            "input": "arr = [3, 10, 2, 1, 20]",
            "output": "3"
        }
    ]
},
{
    "id": "82",
    "title": "Problem 82: Implement A* Search Algorithm",
    "description": "Write a function that implements the A* search algorithm to find the shortest path in a graph.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def a_star_search(graph: dict, start: str, goal: str) -> list:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "graph = {...}, start = 'A', goal = 'G'",
            "output": "['A', 'C', 'G']"
        }
    ]
},
{
    "id": "83",
    "title": "Problem 83: Find Two Numbers That Sum to Target",
    "description": "Write a function that finds two numbers in an array that add up to a given target.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def two_sum(nums: list, target: int) -> list:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "nums = [1,2,3,4], target = 5",
            "output": "[0,3]"
        },
        {
            "input": "nums = [10,20,30], target = 50",
            "output": "[1,2]"
        }
    ]
},
{
    "id": "84",
    "title": "Problem 84: Sum of Two Numbers",
    "description": "Write a function that takes two integers as input and returns their sum.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def sum_two_numbers(a: int, b: int) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "a = 2, b = 3",
            "output": "5"
        },
        {
            "input": "a = 10, b = 20",
            "output": "30"
        }
    ]
},
{
    "id": "85",
    "title": "Problem 85: Check Even or Odd",
    "description": "Write a function that checks if a number is even or odd.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def check_even_odd(n: int) -> str:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "n = 4",
            "output": "Even"
        },
        {
            "input": "n = 7",
            "output": "Odd"
        }
    ]
},
{
    "id": "86",
    "title": "Problem 86: Find Maximum in List",
    "description": "Write a function that finds the maximum number in a given list.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def find_maximum(lst: list) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "lst = [1, 5, 3, 9]",
            "output": "9"
        },
        {
            "input": "lst = [10, 20, 30]",
            "output": "30"
        }
    ]
},
{
    "id": "87",
    "title": "Problem 87: Find First Non-Repeating Character",
    "description": "Write a function that finds the first non-repeating character in a string.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def first_non_repeating_char(s: str) -> str:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "s = 'programming'",
            "output": "'p'"
        },
        {
            "input": "s = 'aabbcc'",
            "output": "''"
        }
    ]
},
{
    "id": "88",
    "title": "Problem 88: Find Longest Increasing Subsequence",
    "description": "Write a function that finds the longest increasing subsequence in an array.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def longest_increasing_subsequence(arr: list) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "arr = [10, 22, 9, 33, 21, 50, 41, 60]",
            "output": "5"
        },
        {
            "input": "arr = [3, 10, 2, 1, 20]",
            "output": "3"
        }
    ]
},
{
    "id": "89",
    "title": "Problem 89: Implement A* Search Algorithm",
    "description": "Write a function that implements the A* search algorithm to find the shortest path in a graph.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def a_star_search(graph: dict, start: str, goal: str) -> list:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "graph = {...}, start = 'A', goal = 'G'",
            "output": "['A', 'C', 'G']"
        }
    ]
},
{
    "id": "90",
    "title": "Problem 90: Find Two Numbers That Sum to Target",
    "description": "Write a function that finds two numbers in an array that add up to a given target.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def two_sum(nums: list, target: int) -> list:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "nums = [1,2,3,4], target = 5",
            "output": "[0,3]"
        },
        {
            "input": "nums = [10,20,30], target = 50",
            "output": "[1,2]"
        }
    ]
},
{
    "id": "91",
    "title": "Problem 91: Sum of Two Numbers",
    "description": "Write a function that takes two integers as input and returns their sum.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def sum_two_numbers(a: int, b: int) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "a = 2, b = 3",
            "output": "5"
        },
        {
            "input": "a = 10, b = 20",
            "output": "30"
        }
    ]
},
{
    "id": "92",
    "title": "Problem 92: Check Even or Odd",
    "description": "Write a function that checks if a number is even or odd.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def check_even_odd(n: int) -> str:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "n = 4",
            "output": "Even"
        },
        {
            "input": "n = 7",
            "output": "Odd"
        }
    ]
},
{
    "id": "93",
    "title": "Problem 93: Find Maximum in List",
    "description": "Write a function that finds the maximum number in a given list.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def find_maximum(lst: list) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "lst = [1, 5, 3, 9]",
            "output": "9"
        },
        {
            "input": "lst = [10, 20, 30]",
            "output": "30"
        }
    ]
},
{
    "id": "94",
    "title": "Problem 94: Find First Non-Repeating Character",
    "description": "Write a function that finds the first non-repeating character in a string.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def first_non_repeating_char(s: str) -> str:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "s = 'programming'",
            "output": "'p'"
        },
        {
            "input": "s = 'aabbcc'",
            "output": "''"
        }
    ]
},
{
    "id": "95",
    "title": "Problem 95: Find Longest Increasing Subsequence",
    "description": "Write a function that finds the longest increasing subsequence in an array.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def longest_increasing_subsequence(arr: list) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "arr = [10, 22, 9, 33, 21, 50, 41, 60]",
            "output": "5"
        },
        {
            "input": "arr = [3, 10, 2, 1, 20]",
            "output": "3"
        }
    ]
},
{
    "id": "96",
    "title": "Problem 96: Implement A* Search Algorithm",
    "description": "Write a function that implements the A* search algorithm to find the shortest path in a graph.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def a_star_search(graph: dict, start: str, goal: str) -> list:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "graph = {...}, start = 'A', goal = 'G'",
            "output": "['A', 'C', 'G']"
        }
    ]
},
{
    "id": "97",
    "title": "Problem 97: Find Two Numbers That Sum to Target",
    "description": "Write a function that finds two numbers in an array that add up to a given target.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def two_sum(nums: list, target: int) -> list:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "nums = [1,2,3,4], target = 5",
            "output": "[0,3]"
        },
        {
            "input": "nums = [10,20,30], target = 50",
            "output": "[1,2]"
        }
    ]
},
{
    "id": "98",
    "title": "Problem 98: Sum of Two Numbers",
    "description": "Write a function that takes two integers as input and returns their sum.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def sum_two_numbers(a: int, b: int) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "a = 2, b = 3",
            "output": "5"
        },
        {
            "input": "a = 10, b = 20",
            "output": "30"
        }
    ]
},
{
    "id": "99",
    "title": "Problem 99: Check Even or Odd",
    "description": "Write a function that checks if a number is even or odd.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def check_even_odd(n: int) -> str:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "n = 4",
            "output": "Even"
        },
        {
            "input": "n = 7",
            "output": "Odd"
        }
    ]
},
{
    "id": "100",
    "title": "Problem 100: Find Maximum in List",
    "description": "Write a function that finds the maximum number in a given list.",
    "difficulty": "Advanced",
    "language": "python",
    "starterCode": "def find_maximum(lst: list) -> int:\n    # Your code here\n    pass",
    "testCases": [
        {
            "input": "lst = [1, 5, 3, 9]",
            "output": "9"
        },
        {
            "input": "lst = [10, 20, 30]",
            "output": "30"
        }
    ]
  }


  // You can add more challenges here
]

export default function CodeChallengePage() {
  const [challenges, setChallenges] = useState<CodeChallenge[]>([])
  const [selectedChallenge, setSelectedChallenge] = useState<CodeChallenge | null>(null)
  const [userCode, setUserCode] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [toast, setToast] = useState<{open: boolean, message: string, severity: 'success' | 'error' | 'warning' | 'info'}>({
    open: false,
    message: '',
    severity: 'info'
  })
  const [allTestsPassed, setAllTestsPassed] = useState(false)

  // Fetch user data from Firestore when auth state changes
  useEffect(() => {
    setChallenges(challengesData);
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch real user data from Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const userSnapshot = await getDoc(userDocRef);
          
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data() as UserProfile;
            setUserProfile(userData);
            
            // Auto-select the next unsolved challenge
            const nextChallengeId = String(userData.problemsSolved + 1);
            const nextChallenge = challengesData.find(c => c.id === nextChallengeId) || challengesData[0];
            if (nextChallenge) {
              setSelectedChallenge(nextChallenge);
            }
          } else {
            console.error('User document does not exist in Firestore');
            setToast({
              open: true,
              message: 'Could not load user profile',
              severity: 'error'
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setToast({
            open: true,
            message: 'Error loading user data',
            severity: 'error'
          });
        }
      } else {
        // User is not logged in, you may want to redirect to login page
        console.log('No user is signed in');
      }
      
      setIsLoadingUser(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Set starter code when a challenge is selected
  useEffect(() => {
    if (selectedChallenge) {
      setUserCode(selectedChallenge.starterCode || '')
      setSelectedLanguage(selectedChallenge.language || 'javascript')
      // Reset results when changing challenges
      setResult(null)
      setAllTestsPassed(false)
    }
  }, [selectedChallenge])

  const handleChallengeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const challengeId = e.target.value
    const challenge = challenges.find(c => c.id === challengeId) || null
    setSelectedChallenge(challenge)
  }

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setUserCode(value)
    }
  }

  const handleCloseToast = () => {
    setToast({...toast, open: false})
  }

  // Function to determine badge color based on difficulty
  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty.toLowerCase()) {
      case 'easy':
      case 'beginner':
        return 'from-green-400 to-green-600';
      case 'medium':
        return 'from-yellow-400 to-yellow-600';
      case 'hard':
      case 'advanced':
        return 'from-red-400 to-red-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  // Move to next challenge button
  const moveToNextChallenge = () => {
    if (!userProfile) return;
    
    // Find the next challenge ID
    const nextChallengeId = String(parseInt(selectedChallenge?.id || "0") + 1);
    const nextChallenge = challengesData.find(c => c.id === nextChallengeId);
    
    if (nextChallenge) {
      setSelectedChallenge(nextChallenge);
      setToast({
        open: true,
        message: 'Moving to next challenge',
        severity: 'info'
      });
    } else {
      setToast({
        open: true,
        message: 'No more challenges available',
        severity: 'warning'
      });
    }
  };

  // Update user's problemsSolved count in the Firestore database
  const updateProblemsSolved = async () => {
    if (!userProfile) return;
    
    try {
      // Update Firestore document with new problemsSolved value
      const userDocRef = doc(db, 'users', userProfile.uid);
      await updateDoc(userDocRef, {
        problemsSolved: userProfile.problemsSolved + 1
      });
      
      // Update local state
      setUserProfile({
        ...userProfile,
        problemsSolved: userProfile.problemsSolved + 1
      });
      
      // Set flag for showing "Next Challenge" button
      setAllTestsPassed(true);
      
      // Show success message
      setToast({
        open: true,
        message: 'Challenge completed! You can now move to the next problem.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating user progress:', error);
      setToast({
        open: true,
        message: 'Error updating progress in database',
        severity: 'error'
      });
    }
  };

  const handleSubmit = async () => {
    if (!selectedChallenge) {
      setToast({
        open: true,
        message: 'No challenge selected',
        severity: 'warning'
      })
      return
    }

    if (!userCode.trim()) {
      setToast({
        open: true,
        message: 'Please enter your code',
        severity: 'warning'
      })
      return
    }

    setIsLoading(true)
    setResult(null)
    setAllTestsPassed(false)

    try {
      const response = await fetch('/api/code/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: userCode,
          language: selectedLanguage,
          model: 'codegemma:7b',
          challenge: {
            id: selectedChallenge.id,
            title: selectedChallenge.title,
            description: selectedChallenge.description,
            testCases: selectedChallenge.testCases
          }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze code')
      }

      const data = await response.json()
      setResult(data)
      
      // Check if all tests passed
      const testsAllPassed = data.testResults && 
                            data.testResults.length > 0 && 
                            data.testResults.every(test => test.passed);
      
      // Set the toast message based on the success status
      if (!data.success) {
        setToast({
          open: true,
          message: data.message || 'Code execution failed',
          severity: 'error'
        });
      } else if (testsAllPassed) {
        // If all tests passed and the challenge ID matches the next unsolved problem,
        // update the user's problemsSolved count in Firestore
        if (userProfile && 
            parseInt(selectedChallenge.id) === userProfile.problemsSolved + 1) {
          await updateProblemsSolved();
        } else {
          setAllTestsPassed(true);
          setToast({
            open: true,
            message: 'All tests passed! Great job!',
            severity: 'success'
          });
        }
      } else {
        // Some tests failed but code executed
        setToast({
          open: true,
          message: 'Code executed successfully ',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error analyzing code:', error)
      setToast({
        open: true,
        message: error instanceof Error ? error.message : 'Unknown error',
        severity: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Function to dismiss the toast after a timeout
  useEffect(() => {
    if (toast.open) {
      const timer = setTimeout(() => {
        handleCloseToast();
      }, 5000); // 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Show loading state while fetching user data
  if (isLoadingUser) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 text-white items-center justify-center">
        <FaSpinner className="text-4xl text-indigo-400 animate-spin mb-4" />
        <p className="text-xl">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 text-white">
      {/* Fixed top navigation bar */}
      

      {/* Main content area */}
      <div className="flex-1 pt-22 px-4 sm:px-6 lg:px-8 pb-8 max-w-7xl mx-auto w-full">
        {/* Title header */}
        <div className="mb-4  border-b border-gray-700 animate-fadeIn">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400">
            Coding Challenges
          </h1>
          <p className="text-gray-300 mt-1">
            Test your skills with algorithmic problems and get AI-powered feedback
          </p>
        </div>

        {/* Challenge selection */}
        <div className="bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-xl p-4 shadow-lg mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select a Challenge
          </label>
          <div className="relative">
            <select
              value={selectedChallenge?.id || ''}
              onChange={handleChallengeChange}
              className="w-full p-3 bg-gray-800/80 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-200 appearance-none"
            >
              <option value="" disabled className="bg-gray-700 text-white">Choose a challenge</option>
              {challenges.map(challenge => (
                <option key={challenge.id} value={challenge.id} className="bg-gray-700 text-white">
                  {challenge.title} ({challenge.difficulty})
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {selectedChallenge && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left panel */}
            <div className="lg:col-span-5 flex flex-col space-y-6 pt-15">
              {/* Challenge description */}
              <div className="bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <FaLightbulb className="text-cyan-400 text-lg" />
                  <h2 className="text-xl font-semibold text-white">{selectedChallenge.title}</h2>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getDifficultyColor(selectedChallenge.difficulty)} text-white`}>
                    {selectedChallenge.difficulty}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-400 to-blue-600 text-white">
                    {selectedChallenge.language}
                  </span>
                </div>
                
                <p className="text-gray-300 mb-4">{selectedChallenge.description}</p>
                
                {selectedChallenge.testCases && selectedChallenge.testCases.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FaTerminal className="text-cyan-400 text-sm" />
                      <h3 className="font-medium text-white">Test Cases</h3>
                    </div>
                    
                    <div className="space-y-3">
                      {selectedChallenge.testCases.map((testCase, index) => (
                        <div key={index} className="bg-gray-800/80 p-3 rounded-lg border border-gray-700">
                          <div className="font-mono text-sm">
                            <span className="text-cyan-400">Test {index + 1}:</span>
                            <div className="mt-1">
                              <span className="text-gray-400">Input:</span> {testCase.input}
                            </div>
                            <div className="mt-1">
                              <span className="text-gray-400">Output:</span> {testCase.output}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Progress indicator */}
                {userProfile && parseInt(selectedChallenge.id) === userProfile.problemsSolved + 1 && (
                  <div className="mt-4 p-3 bg-indigo-900/50 border border-indigo-700 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FaRocket className="text-cyan-400" />
                      <span className="text-sm font-medium">Next challenge to unlock your progress!</span>
                    </div>
                  </div>
                )}
                
                {userProfile && parseInt(selectedChallenge.id) <= userProfile.problemsSolved && (
                  <div className="mt-4 p-3 bg-green-900/50 border border-green-700 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FaTrophy className="text-yellow-400" />
                      <span className="text-sm font-medium">You've already solved this challenge!</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right panel */}
            <div className="lg:col-span-7 flex flex-col space-y-6">
              {/* Code editor */}
              <div className="bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <FaTerminal className="text-cyan-400 text-lg" />
                  <h2 className="text-xl font-semibold text-white">Your Solution</h2>
                  <div className="ml-auto bg-gray-800/80 px-2 py-1 rounded text-xs text-gray-400 font-mono">
                    {selectedLanguage}
                  </div>
                </div>
                
                <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800/80">
                  <Editor
                    height="400px"
                    defaultLanguage={selectedLanguage}
                    language={selectedLanguage}
                    value={userCode}
                    onChange={handleCodeChange}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 14,
                    }}
                  />
                </div>
                
                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={handleSubmit}
                    disabled={isLoading || !userCode.trim()}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <FaSearch />
                        <span>Submit Solution</span>
                      </>
                    )}
                  </button>
                  
                  {/* Next Challenge Button - Only show when all tests have passed */}
                  {allTestsPassed && (
                    <button 
                      onClick={moveToNextChallenge}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white p-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg"
                    >
                      <span>Next Challenge</span>
                      <FaArrowRight />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Results section */}
              {result && (
                <div className="bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-xl shadow-lg animate-fadeIn">
                  <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FaLightbulb className="text-cyan-400 text-lg" />
                      <h2 className="text-xl font-semibold text-white">Results</h2>
                    </div>
                    <div className="text-sm text-gray-400">
                      Processed in {Math.round(result.processingTime / 1000000)} ms
                    </div>
                  </div>
                  
                  <div className="p-4">
                    {/* Status indicator */}
                    <div 
                      className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
                        result.success ? 'bg-green-900/40 border border-green-700' : 'bg-red-900/40 border border-red-700'
                      }`}
                    >
                      {result.success ? (
                        <>
                          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="font-medium">Code Executed Successfully</span>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                            <FaBug className="text-white" />
                          </div>
                          <span className="font-medium">Code Execution Failed</span>
                        </>
                      )}
                    </div>
                    
                    {/* Message if provided */}
                    {result.message && (
                      <div className="mb-4 text-gray-300">
                        {result.message}
                      </div>
                    )}
                    
                    {/* Analysis content */}
                    {result.analysis && (
                      <div className="bg-gray-800/80 rounded-lg border border-gray-700 p-4 overflow-auto">
                        <div className="prose prose-invert max-w-none">
                          <ReactMarkdown>
                            {result.analysis}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                    
                    {/* Test results if available */}
                    {result.testResults && result.testResults.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-medium text-white mb-2">Test Results</h3>
                        <div className="space-y-2">
                          {result.testResults.map((test, index) => (
                            <div 
                              key={index} 
                              className={`p-3 rounded-lg border ${
                                test.passed ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {test.passed ? (
                                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                )}
                                <span className="font-medium">Test {index + 1}</span>
                              </div>
                              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm font-mono">
                                <div>
                                  <div className="text-gray-400">Input:</div>
                                  <div className="break-all">{typeof test.input === 'object' ? JSON.stringify(test.input) : String(test.input)}</div>
                                </div>
                                <div>
                                  <div className="text-gray-400">Expected:</div>
                                  <div className="break-all">{typeof test.expected === 'object' ? JSON.stringify(test.expected) : String(test.expected)}</div>
                                </div>
                                <div>
                                  <div className="text-gray-400">Actual:</div>
                                  <div className="break-all">{typeof test.actual === 'object' ? JSON.stringify(test.actual) : String(test.actual)}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Empty state when no challenge is selected */}
        {!selectedChallenge && (
          <div className="flex flex-col items-center justify-center p-12 bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-xl shadow-lg text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center mb-4">
              <FaCode className="text-white text-2xl" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Select a Challenge to Begin</h2>
            <p className="text-gray-400 max-w-md">
              Choose a coding challenge from the dropdown above to start solving problems and testing your skills.
            </p>
          </div>
        )}
      </div>
      
      {/* Toast notification */}
      {toast.open && (
        <div 
          onClick={handleCloseToast}
          className={`fixed bottom-4 right-4 py-2 px-4 rounded-lg shadow-lg animate-fadeIn cursor-pointer ${
            toast.severity === 'success' ? 'bg-green-800 border border-green-700' :
            toast.severity === 'error' ? 'bg-red-800 border border-red-700' :
            toast.severity === 'warning' ? 'bg-yellow-800 border border-yellow-700' :
            'bg-blue-800 border border-blue-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.severity === 'success' && (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {toast.severity === 'error' && (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {toast.severity === 'warning' && (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {toast.severity === 'info' && (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span>{toast.message}</span>
            <button onClick={handleCloseToast} className="ml-2 text-white opacity-70 hover:opacity-100">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <div className="mt-6 text-center text-gray-400 text-sm py-4">
        <p>&copy; {new Date().getFullYear()} Code Challenges Platform</p>
      </div>
    </div>
  )
}