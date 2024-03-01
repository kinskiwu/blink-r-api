import { Request, Response } from 'express';
import { UrlModel } from '../models/urls.model';
import { generateShortUrl } from '../services/generateShortUrl';
import { v4 as uuid } from 'uuid';

export const createShortUrl = async (req: Request, res: Response) => {
    // validate longUrl
    const { longUrl } = req.body;

    if(!longUrl || typeof longUrl !== 'string'){
      return res.status(400).json({ error: 'Invalid URL provided.' });
    };

  try {
    // Check if longurl already exists in database
    let urlDocument = await UrlModel.findOne({ longUrl });
    let shortUrlId;

    // if longUrl doesnt exisit, create a new document
    if(!urlDocument){
      const longUrlId = uuid();
      shortUrlId = generateShortUrl(longUrlId);

      urlDocument = new UrlModel({
        longUrlId,
        longUrl,
        shortUrls: [{ shortUrlId }],
      });

      await urlDocument.save();
    } else {  // if longUrl exists, add a new shortUrlId to the doc
      shortUrlId = generateShortUrl(urlDocument.longUrlId);
      urlDocument.shortUrls.push({ shortUrlId });
      await urlDocument.save();
    }
    // return shortUrlId to client & 201 created
    res.status(201).json({ shortUrlId });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};