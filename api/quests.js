// API endpoint for quest management
// This file provides the interface for the frontend to fetch quest data

const fs = require('fs').promises;
const path = require('path');

class QuestAPI {
  constructor() {
    this.questsDir = path.join(__dirname, '../quests');
    this.offersDir = path.join(__dirname, '../offers');
  }

  // Get all active quests
  async getAllQuests() {
    try {
      const sonicQuests = await this.loadJSON(path.join(this.questsDir, 'sonic-apps.json'));
      
      return {
        success: true,
        data: {
          quests: sonicQuests.filter(quest => quest.isActive),
          total: sonicQuests.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get quests by category
  async getQuestsByCategory(category) {
    try {
      const allQuests = await this.getAllQuests();
      if (!allQuests.success) return allQuests;

      const filteredQuests = allQuests.data.quests.filter(
        quest => quest.category === category
      );

      return {
        success: true,
        data: {
          quests: filteredQuests,
          category,
          total: filteredQuests.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get all offers
  async getAllOffers() {
    try {
      const ecosystemOffers = await this.loadJSON(path.join(this.offersDir, 'sonic-ecosystem-real.json'));
      const pointsOffers = await this.loadJSON(path.join(this.offersDir, 'sonic-points-earn.json'));
      
      const allOffers = [...ecosystemOffers, ...pointsOffers];
      
      return {
        success: true,
        data: {
          offers: allOffers.filter(offer => offer.isActive),
          total: allOffers.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get featured offers
  async getFeaturedOffers() {
    try {
      const allOffers = await this.getAllOffers();
      if (!allOffers.success) return allOffers;

      const featuredOffers = allOffers.data.offers.filter(
        offer => offer.isFeatured
      );

      return {
        success: true,
        data: {
          offers: featuredOffers,
          total: featuredOffers.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get Sonic-integrated content
  async getSonicIntegratedContent() {
    try {
      const quests = await this.getAllQuests();
      const offers = await this.getAllOffers();

      if (!quests.success || !offers.success) {
        return {
          success: false,
          error: 'Failed to load content'
        };
      }

      // Filter for Sonic-specific content
      const sonicQuests = quests.data.quests.filter(
        quest => quest.category === 'sonic-apps' || quest.sonicApp
      );

      const sonicOffers = offers.data.offers.filter(
        offer => offer.sonicIntegration
      );

      return {
        success: true,
        data: {
          quests: sonicQuests,
          offers: sonicOffers,
          integrations: {
            appsUrl: 'https://my.soniclabs.com/apps',
            pointsUrl: 'https://my.soniclabs.com/points/earn'
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Helper function to load JSON files
  async loadJSON(filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Failed to load ${filePath}: ${error.message}`);
    }
  }
}

// Export for use in frontend
module.exports = QuestAPI;

// Example usage for frontend integration:
/*
const questAPI = new QuestAPI();

// Get all quests
const allQuests = await questAPI.getAllQuests();

// Get Sonic-specific content
const sonicContent = await questAPI.getSonicIntegratedContent();

// Get featured offers
const featured = await questAPI.getFeaturedOffers();
*/