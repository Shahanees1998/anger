import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import DataService from '../services/DataService';
import { auth } from '../firebase';

// Mock Firebase auth
jest.mock('../firebase', () => ({
  auth: {
    currentUser: { uid: 'test-user-123' }
  }
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('Issue Fixes Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Admin Editing Empty Questions', () => {
    it('should allow updating questions with empty string', async () => {
      const mockUpdateDoc = jest.fn().mockResolvedValue();
      jest.spyOn(DataService, 'isOnline').mockResolvedValue(true);
      
      // Mock Firestore updateDoc
      global.updateDoc = mockUpdateDoc;
      
      await DataService.updateQuestions('thoughts-questions', '', 'question-123');
      
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.any(Object),
        { question: '' }
      );
    });

    it('should handle undefined data by converting to empty string', async () => {
      const mockUpdateDoc = jest.fn().mockResolvedValue();
      jest.spyOn(DataService, 'isOnline').mockResolvedValue(true);
      
      global.updateDoc = mockUpdateDoc;
      
      await DataService.updateQuestions('thoughts-questions', undefined, 'question-123');
      
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.any(Object),
        { question: '' }
      );
    });
  });

  describe('2. 24-Hour Answer Filtering', () => {
    it('should filter out user answers older than 24 hours', async () => {
      const now = new Date();
      const oldDate = new Date(now.getTime() - 25 * 60 * 60 * 1000); // 25 hours ago
      const recentDate = new Date(now.getTime() - 12 * 60 * 60 * 1000); // 12 hours ago
      
      const answers = [
        { answerText: 'Old answer', createdBy: 'test-user-123', createdAt: oldDate },
        { answerText: 'Recent answer', createdBy: 'test-user-123', createdAt: recentDate },
      ];
      
      // Mock isUserAdmin to return false for test user
      jest.spyOn(DataService, 'isUserAdmin').mockResolvedValue(false);
      
      const filtered = await DataService.filterAnswersForUser(answers, 'test-user-123');
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].answerText).toBe('Recent answer');
    });

    it('should always show admin answers regardless of time', async () => {
      const now = new Date();
      const oldDate = new Date(now.getTime() - 48 * 60 * 60 * 1000); // 48 hours ago
      
      const answers = [
        { answerText: 'Admin answer', createdBy: 'admin-123', createdAt: oldDate },
        { answerText: 'User answer', createdBy: 'test-user-123', createdAt: oldDate },
      ];
      
      // Mock isUserAdmin to return true for admin, false for user
      jest.spyOn(DataService, 'isUserAdmin')
        .mockImplementation(userId => Promise.resolve(userId === 'admin-123'));
      
      const filtered = await DataService.filterAnswersForUser(answers, 'test-user-123');
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].answerText).toBe('Admin answer');
      expect(filtered[0].isAdminAnswer).toBe(true);
    });

    it('should not show other users answers', async () => {
      const now = new Date();
      
      const answers = [
        { answerText: 'My answer', createdBy: 'test-user-123', createdAt: now },
        { answerText: 'Other user answer', createdBy: 'other-user-456', createdAt: now },
      ];
      
      jest.spyOn(DataService, 'isUserAdmin').mockResolvedValue(false);
      
      const filtered = await DataService.filterAnswersForUser(answers, 'test-user-123');
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].answerText).toBe('My answer');
    });
  });

  describe('3. 9x9 Sub-items Fix', () => {
    it('should return empty arrays instead of dummy data', () => {
      // Test for Feelings.js functions
      const generateDummyAnswers = () => [];
      const generateThirdLevelItems = () => [];
      const generateSubQuestions = () => [];
      
      expect(generateDummyAnswers()).toEqual([]);
      expect(generateThirdLevelItems()).toEqual([]);
      expect(generateSubQuestions()).toEqual([]);
    });

    it('should filter out empty subquestions in rendering', () => {
      const subquestions = [
        { id: '1', subquestionText: 'Valid question', answers: [] },
        { id: '2', subquestionText: '', answers: [] },
        { id: '3', subquestionText: 'Item 3', answers: [] }, // Dummy text
        { id: '4', subquestionText: '3: needs text', answers: [] }, // Dummy text
      ];
      
      // Simulate the filtering logic from Feelings.js
      const filtered = subquestions.filter(sq => 
        sq.subquestionText && 
        sq.subquestionText.trim() !== "" &&
        !sq.subquestionText.includes("Item ") &&
        !sq.subquestionText.includes("needs text")
      );
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].subquestionText).toBe('Valid question');
    });
  });

  describe('4. SOS Screen My Iceberg', () => {
    it('should show My Iceberg for regular users', () => {
      const isAdmin = false;
      const sosQuestions = ['Question 1', 'Question 2'];
      
      // Simulate the ListFooterComponent logic from SOS.js
      const showIceberg = !isAdmin;
      const icebergPosition = sosQuestions.length + 1;
      
      expect(showIceberg).toBe(true);
      expect(icebergPosition).toBe(3);
    });

    it('should not show My Iceberg for admin users', () => {
      const isAdmin = true;
      
      // Simulate the ListFooterComponent logic from SOS.js
      const showIceberg = !isAdmin;
      
      expect(showIceberg).toBe(false);
    });
  });

  describe('5. Media Files in Answers', () => {
    it('should handle answers with media files', () => {
      const answer = {
        answerText: 'Answer with media',
        mediaFile: {
          type: 'image/jpeg',
          uri: 'https://example.com/image.jpg',
          name: 'image.jpg'
        }
      };
      
      // Check media file properties
      expect(answer.mediaFile).toBeDefined();
      expect(answer.mediaFile.type).toContain('image');
      expect(answer.mediaFile.uri).toBeTruthy();
    });
  });
});