/**
 * DSA Utilities for Red Drop AI
 * 
 * Contains production-ready data structures used throughout the system:
 * - MinHeap / Priority Queue → Emergency request prioritization
 * - Graph + Dijkstra → Nearest donor route calculation
 * - Trie → Fast donor name/location prefix search
 * - Scheduling → Donor availability management
 */

// =====================================================
// 1. MIN-HEAP (Priority Queue)
// Used for: Processing emergency blood requests by priority
// Time: O(log n) insert/extract
// =====================================================
class MinHeap {
  constructor(comparator = (a, b) => a.priority - b.priority) {
    this.heap = [];
    this.comparator = comparator;
  }

  get size() { return this.heap.length; }
  isEmpty() { return this.size === 0; }

  insert(item) {
    this.heap.push(item);
    this._bubbleUp(this.size - 1);
  }

  extractMin() {
    if (this.isEmpty()) return null;
    const min = this.heap[0];
    const last = this.heap.pop();
    if (!this.isEmpty()) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return min;
  }

  peek() { return this.isEmpty() ? null : this.heap[0]; }

  _bubbleUp(idx) {
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      if (this.comparator(this.heap[idx], this.heap[parent]) < 0) {
        [this.heap[idx], this.heap[parent]] = [this.heap[parent], this.heap[idx]];
        idx = parent;
      } else break;
    }
  }

  _sinkDown(idx) {
    while (true) {
      let smallest = idx;
      const left = 2 * idx + 1, right = 2 * idx + 2;
      if (left < this.size && this.comparator(this.heap[left], this.heap[smallest]) < 0) smallest = left;
      if (right < this.size && this.comparator(this.heap[right], this.heap[smallest]) < 0) smallest = right;
      if (smallest !== idx) {
        [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
        idx = smallest;
      } else break;
    }
  }
}

// =====================================================
// 2. GRAPH + DIJKSTRA
// Used for: Finding shortest route from donor to hospital
// Time: O((V + E) log V) with binary heap
// =====================================================
class Graph {
  constructor() {
    this.adjacencyList = new Map();
  }

  addVertex(vertex) {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
    }
  }

  addEdge(v1, v2, weight) {
    this.adjacencyList.get(v1)?.push({ node: v2, weight });
    this.adjacencyList.get(v2)?.push({ node: v1, weight });
  }

  // Dijkstra's shortest path
  dijkstra(start, end) {
    const distances = new Map();
    const previous = new Map();
    const pq = new MinHeap((a, b) => a.dist - b.dist);
    const visited = new Set();

    for (const vertex of this.adjacencyList.keys()) {
      distances.set(vertex, vertex === start ? 0 : Infinity);
      previous.set(vertex, null);
    }

    pq.insert({ node: start, dist: 0 });

    while (!pq.isEmpty()) {
      const { node: current, dist: currentDist } = pq.extractMin();
      if (visited.has(current)) continue;
      visited.add(current);

      if (current === end) break;

      for (const { node: neighbor, weight } of this.adjacencyList.get(current) || []) {
        const newDist = currentDist + weight;
        if (newDist < distances.get(neighbor)) {
          distances.set(neighbor, newDist);
          previous.set(neighbor, current);
          pq.insert({ node: neighbor, dist: newDist });
        }
      }
    }

    // Reconstruct path
    const path = [];
    let current = end;
    while (current !== null) {
      path.unshift(current);
      current = previous.get(current);
    }

    return {
      distance: distances.get(end),
      path: distances.get(end) !== Infinity ? path : []
    };
  }
}

// =====================================================
// 3. TRIE
// Used for: Autocomplete search for donor names, cities
// Time: O(m) search where m = query length
// =====================================================
class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
    this.data = null;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word, data = null) {
    let node = this.root;
    for (const char of word.toLowerCase()) {
      if (!node.children[char]) node.children[char] = new TrieNode();
      node = node.children[char];
    }
    node.isEnd = true;
    node.data = data;
  }

  search(word) {
    let node = this.root;
    for (const char of word.toLowerCase()) {
      if (!node.children[char]) return false;
      node = node.children[char];
    }
    return node.isEnd;
  }

  startsWith(prefix) {
    let node = this.root;
    for (const char of prefix.toLowerCase()) {
      if (!node.children[char]) return [];
      node = node.children[char];
    }
    return this._getAllWords(node, prefix.toLowerCase());
  }

  _getAllWords(node, prefix) {
    const results = [];
    if (node.isEnd) results.push({ word: prefix, data: node.data });
    for (const [char, child] of Object.entries(node.children)) {
      results.push(...this._getAllWords(child, prefix + char));
    }
    return results.slice(0, 10); // Limit to 10 results
  }
}

// =====================================================
// 4. PRIORITY QUEUE (for emergency requests)
// Used for: Serving critical blood requests first
// =====================================================
class EmergencyPriorityQueue {
  constructor() {
    // Max-heap by urgency score
    this.heap = new MinHeap((a, b) => b.urgencyScore - a.urgencyScore);
  }

  enqueue(request) {
    const urgencyScore = this._calculateUrgency(request);
    this.heap.insert({ ...request, urgencyScore });
  }

  dequeue() { return this.heap.extractMin(); }
  peek() { return this.heap.peek(); }
  isEmpty() { return this.heap.isEmpty(); }

  _calculateUrgency(request) {
    const levelScores = { critical: 100, high: 75, medium: 50, low: 25 };
    const baseScore = levelScores[request.emergencyLevel] || 50;
    const timeFactor = Math.min(50, (Date.now() - new Date(request.createdAt)) / (60 * 1000));
    return baseScore + timeFactor;
  }
}

// =====================================================
// 5. SCHEDULING ALGORITHM
// Used for: Matching donor availability windows
// =====================================================
class DonorScheduler {
  // Find donors available at a given time
  static findAvailableDonors(donors, requestTime) {
    const requestDay = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(requestTime).getDay()];
    const requestHour = new Date(requestTime).getHours();

    return donors.filter(donor => {
      if (!donor.availability.isAvailable) return false;
      if (!donor.availability.schedule?.length) return true; // No schedule = always available

      return donor.availability.schedule.some(slot => {
        if (slot.day !== requestDay) return false;
        const [startH] = slot.startTime.split(':').map(Number);
        const [endH] = slot.endTime.split(':').map(Number);
        return requestHour >= startH && requestHour < endH;
      });
    });
  }

  // Interval scheduling: find non-overlapping donation slots
  static optimizeDonationSchedule(requests) {
    // Sort by deadline (earliest deadline first)
    const sorted = [...requests].sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt));
    const selected = [];
    let lastEnd = 0;

    for (const req of sorted) {
      const start = new Date(req.createdAt).getTime();
      if (start >= lastEnd) {
        selected.push(req);
        lastEnd = new Date(req.expiresAt).getTime();
      }
    }
    return selected;
  }
}

module.exports = { MinHeap, Graph, Trie, EmergencyPriorityQueue, DonorScheduler, priorityQueue: EmergencyPriorityQueue };
