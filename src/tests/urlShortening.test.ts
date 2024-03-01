import request from 'supertest';
import express, { Express } from 'express';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';

// Mock url model & url func in urlController
jest.mock('../models/urls.model', () => ({
  UrlModel: {
    findOne: jest.fn(),
    save: jest.fn(),
  },
}));

jest.mock('../services/generateShortUrl', () => ({
  generateShortUrl: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('POST /createShortUrl', () => {

});
