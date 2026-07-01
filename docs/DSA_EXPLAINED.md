# 🧠 DSA Concepts in Red Drop AI

This document explains every Data Structure & Algorithm used in Red Drop AI — perfect for interviews.

---

## 1. 📍 Graph + Dijkstra — Nearest Donor Route

**File:** `backend/utils/dsa.utils.js` → `Graph`, `dijkstra()`

**What it does:**
- Models the city as a graph where nodes = locations, edges = roads
- Dijkstra's algorithm finds the shortest path from donor to hospital

**Complexity:** O((V + E) log V) using binary min-heap

**Interview answer:**
> "I used a weighted directed graph with Dijkstra's algorithm to calculate the shortest route from a donor's location to the hospital. Each intersection is a node; road segments are weighted edges by distance. I used a min-heap priority queue for O(log n) extraction."

---

## 2. 🚨 Priority Queue / Min-Heap — Emergency Request Processing

**File:** `backend/utils/dsa.utils.js` → `MinHeap`, `EmergencyPriorityQueue`

**What it does:**
- Blood requests are inserted into a max-heap by urgency score
- Critical requests are always served first
- Time-decayed urgency: older requests get higher scores

**Complexity:** O(log n) insert/extract

**Interview answer:**
> "I built a custom priority queue using a min-heap to process blood requests. Critical requests have urgency score 100, high = 75, medium = 50, low = 25. A time-decay factor is added so older requests rise in priority. This ensures no request starves while critical cases are served immediately."

---

## 3. 🔤 Trie — Autocomplete Donor Search

**File:** `backend/utils/dsa.utils.js` → `Trie`

**What it does:**
- Enables O(m) prefix-based search for donor names and cities
- m = length of search query
- Returns top 10 matching results

**Complexity:** O(m) search, O(m) insert

**Interview answer:**
> "I implemented a Trie data structure for donor name and city autocomplete. Unlike linear search O(n), Trie gives O(m) search time where m is query length, making search instant even with millions of donors."

---

## 4. 🗺️ Geospatial Index — MongoDB $near

**File:** `backend/controllers/donor.controller.js`

**What it does:**
- MongoDB 2dsphere index creates a spatial tree (similar to R-Tree / KD-Tree)
- $near query finds all donors within radius, sorted by distance
- Haversine formula calculates exact km distance

**Complexity:** O(log n) with spatial index

**Interview answer:**
> "For location-based donor search, I used MongoDB's 2dsphere geospatial index which internally uses an R-Tree structure. Combined with the $near operator, it finds all donors within a configurable radius in O(log n) time, far faster than scanning all donors."

---

## 5. 🏥 Hash Map — Blood Group Compatibility O(1)

**File:** `backend/controllers/donor.controller.js` → `bloodCompatibility`

**What it does:**
- Pre-computed hash map of which blood groups can donate to which
- O(1) lookup instead of O(n²) checking all combinations

```js
const bloodCompatibility = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal donor
  'AB+': ['AB+'] // Can only donate to AB+
};
```

---

## 6. 📅 Scheduling Algorithm — Donor Availability

**File:** `backend/utils/dsa.utils.js` → `DonorScheduler`

**What it does:**
- Earliest Deadline First (EDF) scheduling for blood requests
- Interval scheduling to find non-overlapping donation windows
- Filters donors available at a specific time

**Interview answer:**
> "I used Earliest Deadline First scheduling to optimize which blood requests a donor serves. It's a greedy algorithm that selects tasks by deadline, maximizing the number of completed requests while respecting donor availability windows."

---

## 7. 🔄 Multi-Criteria Scoring — Donor Ranking

**File:** `backend/controllers/donor.controller.js` → `calculateDonorScore()`

**What it does:**
Weighted score formula:
```
score = (distanceScore × 0.5) + (responseRate × 0.3) + (availabilityScore × 0.2)
```

This is a **weighted optimization problem** — similar to multi-dimensional sorting used in recommendation systems.

---

## 8. 🤖 AI Fake Detection — Heuristic Analysis

**File:** `backend/controllers/request.controller.js` → `analyzeRequest()`
**File:** `backend/services/aiVerification.service.js`

**What it does:**
- Rule-based scoring system assigns suspicion scores
- Multiple independent checks: account age, duplicate requests, unrealistic data
- Confidence scores returned to user

**Complexity:** O(1) per check, O(k) for k checks

**Algorithm type:** Heuristic + Ensemble detection

---

## 🏗️ C++ Microservice (Optional Enhancement)

For production-scale route calculation, a C++ microservice can replace the JS Dijkstra:

```cpp
// route_service.cpp
#include <bits/stdc++.h>
using namespace std;

typedef pair<double, int> pdi;

vector<double> dijkstra(int src, vector<vector<pdi>>& adj, int n) {
    vector<double> dist(n, INT_MAX);
    priority_queue<pdi, vector<pdi>, greater<pdi>> pq;
    dist[src] = 0;
    pq.push({0, src});
    
    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;
        for (auto [w, v] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}
```

**Why C++ is faster:**
- 10-100x faster than JavaScript for graph algorithms
- Direct memory management, no garbage collection pauses
- SIMD optimizations for distance calculations
- Expose via gRPC or REST from Node.js

**Integration with Node.js:**
```js
// Call C++ service via HTTP
const routeRes = await axios.post('http://cpp-route-service/shortest-path', { src, dst });
```

---

## Summary Table

| Algorithm | Time Complexity | Used For |
|-----------|----------------|----------|
| Dijkstra (Graph) | O((V+E) log V) | Shortest donor route |
| Min-Heap | O(log n) | Emergency prioritization |
| Trie | O(m) | Donor search autocomplete |
| 2dsphere Index | O(log n) | Nearby donor geosearch |
| Hash Map | O(1) | Blood group compatibility |
| EDF Scheduling | O(n log n) | Donor availability |
| Haversine | O(1) | Distance calculation |
