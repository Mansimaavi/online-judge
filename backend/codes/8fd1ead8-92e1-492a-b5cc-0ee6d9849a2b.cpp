#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>
using namespace std;

class Solution {
  public:
    vector<int> shortestPath(vector<vector<int>>& edges, int N, int M) {
        vector<vector<int>> adjlist(N); 
        for (int i = 0; i < M; i++) {
            int u = edges[i][0];
            int v = edges[i][1];
            adjlist[u].push_back(v);
            adjlist[v].push_back(u);
        }

        vector<int> distance(N, -1);  // -1 means not reachable
        queue<int> q;
        q.push(0);
        distance[0] = 0;

        while (!q.empty()) {
            int node = q.front();
            q.pop();

            for (int neighbor : adjlist[node]) {
                if (distance[neighbor] == -1) {  // Not visited yet
                    distance[neighbor] = distance[node] + 1;
                    q.push(neighbor);
                }
            }
        }

        return distance;
    }
};


int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int N, M;
    cin >> N >> M;
    
    vector<vector<int>> edges(M, vector<int>(2));
    for(int i = 0; i < M; i++) {
        cin >> edges[i][0] >> edges[i][1];
    }
    
    Solution sol;
    vector<int> dist = sol.shortestPath(edges, N, M);
    
    for(int i = 0; i < dist.size(); i++) {
        cout << dist[i];
        if(i < dist.size() - 1) cout << " ";
    }
    cout << endl;
    
    return 0;
}