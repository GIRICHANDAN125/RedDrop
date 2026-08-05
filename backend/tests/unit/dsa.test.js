const { MinHeap, Graph, Trie, EmergencyPriorityQueue, DonorScheduler } = require('../../utils/dsa.utils');

describe('Unit Test: DSA Utilities', () => {
  describe('MinHeap / PriorityQueue', () => {
    test('should insert items and extract minimum in priority order', () => {
      const heap = new MinHeap((a, b) => a.priority - b.priority);
      heap.insert({ name: 'Low Priority', priority: 5 });
      heap.insert({ name: 'Critical Priority', priority: 1 });
      heap.insert({ name: 'Medium Priority', priority: 3 });

      expect(heap.size).toBe(3);
      expect(heap.peek().name).toBe('Critical Priority');
      expect(heap.extractMin().name).toBe('Critical Priority');
      expect(heap.extractMin().name).toBe('Medium Priority');
      expect(heap.extractMin().name).toBe('Low Priority');
      expect(heap.isEmpty()).toBe(true);
    });
  });

  describe('Trie Prefix Search', () => {
    test('should insert and search by prefix correctly using startsWith', () => {
      const trie = new Trie();
      trie.insert('john', { id: 1 });
      trie.insert('johnny', { id: 2 });
      trie.insert('jonathan', { id: 3 });

      const results = trie.startsWith('joh');
      expect(results.length).toBe(2);
      expect(results.map(r => r.data.id)).toEqual([1, 2]);
    });
  });

  describe('Graph & Dijkstra', () => {
    test('should calculate shortest path between vertices', () => {
      const graph = new Graph();
      graph.addVertex('A');
      graph.addVertex('B');
      graph.addVertex('C');
      graph.addEdge('A', 'B', 4);
      graph.addEdge('B', 'C', 2);
      graph.addEdge('A', 'C', 10);

      const result = graph.dijkstra('A', 'C');
      expect(result.distance).toBe(6);
      expect(result.path).toEqual(['A', 'B', 'C']);
    });
  });

  describe('EmergencyPriorityQueue', () => {
    test('should enqueue critical emergency request with higher urgency score', () => {
      const queue = new EmergencyPriorityQueue();
      queue.enqueue({ id: 1, emergencyLevel: 'critical', createdAt: new Date() });
      queue.enqueue({ id: 2, emergencyLevel: 'low', createdAt: new Date() });

      expect(queue.peek().id).toBe(1);
    });
  });
});
