const axios = require('axios');
const RequestHistory = require('../entities/RequestHistory');

class RequestController {
  // Execute HTTP request
  async executeRequest(req, res) {
    const startTime = Date.now();
    
    try {
      const { method, url, headers, body, name, description, collection, tags } = req.body;
      
      // Prepare axios config
      const config = {
        method: method.toLowerCase(),
        url,
        headers: headers || {},
        timeout: 30000, // 30 second timeout
        validateStatus: () => true, // Don't throw on any status code
      };

      // Add body for methods that support it
      if (['post', 'put', 'patch'].includes(method.toLowerCase()) && body) {
        config.data = body;
      }

      // Execute request
      const response = await axios(config);
      const responseTime = Date.now() - startTime;

      // Create request history entry
      const historyEntry = new RequestHistory();
      historyEntry.method = method.toUpperCase();
      historyEntry.url = url;
      historyEntry.headers = headers || {};
      historyEntry.body = body || null;
      historyEntry.response = {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      };
      historyEntry.status = response.status;
      historyEntry.responseTime = responseTime;
      historyEntry.name = name || `${method.toUpperCase()} ${url}`;
      historyEntry.description = description || '';
      historyEntry.collection = collection || 'Default';
      historyEntry.tags = tags || [];

      // Save to database
      const em = req.orm.em.fork();
      await em.persistAndFlush(historyEntry);

      res.json({
        success: true,
        id: historyEntry.id,
        response: historyEntry.response,
        responseTime,
        timestamp: historyEntry.timestamp
      });

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Save failed request to history
      try {
        const historyEntry = new RequestHistory();
        historyEntry.method = req.body.method?.toUpperCase() || 'GET';
        historyEntry.url = req.body.url || '';
        historyEntry.headers = req.body.headers || {};
        historyEntry.body = req.body.body || null;
        historyEntry.response = {
          error: error.message,
          code: error.code,
          status: error.response?.status || 0
        };
        historyEntry.status = error.response?.status || 0;
        historyEntry.responseTime = responseTime;
        historyEntry.name = req.body.name || `${req.body.method?.toUpperCase() || 'GET'} ${req.body.url || ''}`;
        historyEntry.description = req.body.description || '';
        historyEntry.collection = req.body.collection || 'Default';
        historyEntry.tags = req.body.tags || [];

        const em = req.orm.em.fork();
        await em.persistAndFlush(historyEntry);
      } catch (saveError) {
        console.error('Error saving failed request:', saveError);
      }

      res.status(500).json({
        success: false,
        error: error.message,
        responseTime
      });
    }
  }

  // Get request history with pagination
  async getHistory(req, res) {
    try {
      const { page = 1, limit = 20, sortBy = 'timestamp', sortOrder = 'desc' } = req.query;
      const offset = (page - 1) * limit;

      const em = req.orm.em.fork();
      
      const [requests, total] = await em.findAndCount(RequestHistory, {}, {
        orderBy: { [sortBy]: sortOrder },
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: requests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get specific request by ID
  async getRequestById(req, res) {
    try {
      const { id } = req.params;
      const em = req.orm.em.fork();
      
      const request = await em.findOne(RequestHistory, { id: parseInt(id) });
      
      if (!request) {
        return res.status(404).json({
          success: false,
          error: 'Request not found'
        });
      }

      res.json({
        success: true,
        data: request
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Delete request from history
  async deleteRequest(req, res) {
    try {
      const { id } = req.params;
      const em = req.orm.em.fork();
      
      const request = await em.findOne(RequestHistory, { id: parseInt(id) });
      
      if (!request) {
        return res.status(404).json({
          success: false,
          error: 'Request not found'
        });
      }

      await em.removeAndFlush(request);

      res.json({
        success: true,
        message: 'Request deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Update request (name, description, favorite status)
  async updateRequest(req, res) {
    try {
      const { id } = req.params;
      const { name, description, isFavorite, collection, tags } = req.body;
      
      const em = req.orm.em.fork();
      const request = await em.findOne(RequestHistory, { id: parseInt(id) });
      
      if (!request) {
        return res.status(404).json({
          success: false,
          error: 'Request not found'
        });
      }

      // Update fields if provided
      if (name !== undefined) request.name = name;
      if (description !== undefined) request.description = description;
      if (isFavorite !== undefined) request.isFavorite = isFavorite;
      if (collection !== undefined) request.collection = collection;
      if (tags !== undefined) request.tags = tags;

      await em.flush();

      res.json({
        success: true,
        data: request
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get collections
  async getCollections(req, res) {
    try {
      const em = req.orm.em.fork();
      
      const collections = await em.createQueryBuilder(RequestHistory, 'r')
        .select('r.collection')
        .addSelect('COUNT(r.id)', 'count')
        .groupBy('r.collection')
        .orderBy({ 'r.collection': 'ASC' })
        .execute();

      res.json({
        success: true,
        data: collections
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get requests by collection
  async getRequestsByCollection(req, res) {
    try {
      const { collection } = req.params;
      const { page = 1, limit = 20, sortBy = 'timestamp', sortOrder = 'desc' } = req.query;
      const offset = (page - 1) * limit;

      const em = req.orm.em.fork();
      
      const [requests, total] = await em.findAndCount(RequestHistory, 
        { collection }, 
        {
          orderBy: { [sortBy]: sortOrder },
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      );

      res.json({
        success: true,
        data: requests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get favorite requests
  async getFavorites(req, res) {
    try {
      const { page = 1, limit = 20, sortBy = 'timestamp', sortOrder = 'desc' } = req.query;
      const offset = (page - 1) * limit;

      const em = req.orm.em.fork();
      
      const [requests, total] = await em.findAndCount(RequestHistory, 
        { isFavorite: true }, 
        {
          orderBy: { [sortBy]: sortOrder },
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      );

      res.json({
        success: true,
        data: requests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Search requests
  async searchRequests(req, res) {
    try {
      const { q, page = 1, limit = 20, sortBy = 'timestamp', sortOrder = 'desc' } = req.query;
      const offset = (page - 1) * limit;

      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }

      const em = req.orm.em.fork();
      
      const [requests, total] = await em.findAndCount(RequestHistory, 
        {
          $or: [
            { name: { $like: `%${q}%` } },
            { url: { $like: `%${q}%` } },
            { description: { $like: `%${q}%` } }
          ]
        },
        {
          orderBy: { [sortBy]: sortOrder },
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      );

      res.json({
        success: true,
        data: requests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get request statistics
  async getStats(req, res) {
    try {
      const em = req.orm.em.fork();
      
      const totalRequests = await em.count(RequestHistory);
      const favoriteRequests = await em.count(RequestHistory, { isFavorite: true });
      
      const methodStats = await em.createQueryBuilder(RequestHistory, 'r')
        .select('r.method')
        .addSelect('COUNT(r.id)', 'count')
        .groupBy('r.method')
        .orderBy({ count: 'DESC' })
        .execute();

      const statusStats = await em.createQueryBuilder(RequestHistory, 'r')
        .select('r.status')
        .addSelect('COUNT(r.id)', 'count')
        .groupBy('r.status')
        .orderBy({ count: 'DESC' })
        .execute();

      const avgResponseTime = await em.createQueryBuilder(RequestHistory, 'r')
        .select('AVG(r.responseTime)', 'avg')
        .execute();

      res.json({
        success: true,
        data: {
          totalRequests,
          favoriteRequests,
          methodStats,
          statusStats,
          avgResponseTime: avgResponseTime[0]?.avg || 0
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Export requests
  async exportRequests(req, res) {
    try {
      const { format = 'json', collection, favorite } = req.query;
      
      const em = req.orm.em.fork();
      
      let filters = {};
      if (collection) filters.collection = collection;
      if (favorite === 'true') filters.isFavorite = true;
      
      const requests = await em.find(RequestHistory, filters, {
        orderBy: { timestamp: 'desc' }
      });

      if (format === 'csv') {
        // Simple CSV export
        const headers = ['ID', 'Method', 'URL', 'Status', 'Response Time', 'Timestamp', 'Collection'];
        const rows = requests.map(r => [
          r.id,
          r.method,
          r.url,
          r.status,
          r.responseTime,
          r.timestamp,
          r.collection
        ]);
        
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="requests.csv"');
        res.send(csv);
      } else {
        res.json({
          success: true,
          data: requests,
          exportedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Bulk delete requests
  async bulkDelete(req, res) {
    try {
      const { ids } = req.body;
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'IDs array is required'
        });
      }

      const em = req.orm.em.fork();
      
      const requests = await em.find(RequestHistory, { id: { $in: ids } });
      
      if (requests.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No requests found with provided IDs'
        });
      }

      await em.removeAndFlush(requests);

      res.json({
        success: true,
        message: `${requests.length} requests deleted successfully`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Bulk favorite/unfavorite requests
  async bulkFavorite(req, res) {
    try {
      const { ids, favorite } = req.body;
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'IDs array is required'
        });
      }

      const em = req.orm.em.fork();
      
      const requests = await em.find(RequestHistory, { id: { $in: ids } });
      
      if (requests.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No requests found with provided IDs'
        });
      }

      requests.forEach(request => {
        request.isFavorite = favorite === true;
      });

      await em.flush();

      res.json({
        success: true,
        message: `${requests.length} requests updated successfully`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new RequestController();