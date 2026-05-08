const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY || '2dc3d5ac442a4f699e4d84f3b7f9d507';
const BASE_URL = 'https://api.themoviedb.org/3';

exports.proxyTMDB = async (req, res) => {
  try {
    const endpoint = req.params.endpoint || req.params[0] || ''; 
    const isSearch = endpoint.startsWith('search');
    
    // construct query params
    const qParams = new URLSearchParams(req.query);
    qParams.append('api_key', TMDB_API_KEY);
    
    // axios request
    const url = `${BASE_URL}/${endpoint}?${qParams.toString()}`;
    const response = await axios.get(url);

    res.status(200).json(response.data);
  } catch (err) {
    if(err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(500).json({ error: 'TMDB Request Failed' });
    }
  }
};
