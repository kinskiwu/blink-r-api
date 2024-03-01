import { Request, Response, NextFunction } from 'express';
import { UrlModel } from '../models/urls.model';
import { generateShortUrl } from '../services/generateShortUrl';
import { v4 as uuid } from 'uuid';
import { isValidUrl } from '../services/helpers';

export const createShortUrl = async (req: Request, res: Response, next: NextFunction) => {
    // validate url
    const { longUrl } = req.body;

    if(!isValidUrl(longUrl)){
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
    next({
      status: 500,
      message: 'Server error',
      err
    })
  }
};

export const redirectToLongUrl = async (req: Request, res: Response, next: NextFunction) => {
    // validate url
    const { shortUrlId } = req.params;
    if(!isValidUrl(shortUrlId)){
        return res.status(400).json({ error: 'Invalid URL provided.' });
    };

  try {
    const urlDocument = await UrlModel.findOne({ "shortUrls.shortUrlId": shortUrlId });

    if (urlDocument) {
      return res.redirect(301, urlDocument.longUrl);
    } else {
      return res.status(404).json({ error: "Short URL not found" });
    }
  } catch (err) {
    next({
      status: 500,
      message: 'Server error',
      err
    })
  }

}