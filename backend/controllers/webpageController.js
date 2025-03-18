// controllers/webpageController.js
const ollamaService = require('../services/ollamaService');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

// Summarize webpage
exports.summarizeWebpage = async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // Check if Ollama service is available with the WEBPAGE_MODEL
    try {
      const isServiceAvailable = await ollamaService.checkServiceAvailability(
        process.env.WEBPAGE_MODEL || 'llama3:latest'
      );
      if (!isServiceAvailable) {
        return res.status(503).json({ 
          error: 'Ollama service is unavailable. Make sure Ollama is running and the model is installed.'
        });
      }
    } catch (serviceError) {
      return res.status(503).json({ 
        error: `Ollama service error: ${serviceError.message}`
      });
    }
    
    // Fetch webpage content
    let response;
    try {
      response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
      });
      
      if (!response.ok) {
        return res.status(400).json({ 
          error: `Failed to fetch webpage: ${response.statusText}`
        });
      }
    } catch (fetchError) {
      return res.status(400).json({ 
        error: `Could not access the URL: ${fetchError.message}`
      });
    }
    
    const html = await response.text();
    
    // Parse HTML and extract main content
    const $ = cheerio.load(html);
    
    // Remove scripts, styles, and other non-content elements
    $('script, style, meta, link, noscript, iframe, svg, header, footer, nav, aside').remove();
    
    // Extract title
    const title = $('title').text().trim() || 'Untitled Page';
    
    // Extract text content from main content areas (adjust selectors as needed)
    const contentSelectors = [
      'article', 'main', '.content', '#content', '.post', '.article', 
      '.post-content', '.entry-content', '.page-content', '.main-content',
      'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol'
    ];
    
    let content = '';
    
    for (const selector of contentSelectors) {
      $(selector).each((i, el) => {
        const text = $(el).text().trim();
        if (text) {
          content += text + ' ';
        }
      });
    }
    
    // Fallback: if no content found, get all body text
    if (!content.trim()) {
      content = $('body').text().trim();
    }
    
    // Clean up the text (remove excess whitespace, etc.)
    content = content.replace(/\s+/g, ' ').trim();
    
    // If content is still empty, return error
    if (!content) {
      return res.status(400).json({ 
        error: 'Could not extract meaningful content from the webpage'
      });
    }
    
    // Limit content length to avoid token limits
    const maxContentLength = 8000;
    if (content.length > maxContentLength) {
      console.log(`Content truncated from ${content.length} to ${maxContentLength} characters`);
      content = content.substring(0, maxContentLength) + '...';
    }
    
    // Generate summary using the ollamaService
    const summary = await ollamaService.summarizeWebpage(title, url, content);
    
    return res.status(200).json({ 
      title,
      url,
      summary,
      contentLength: content.length
    });
  } catch (error) {
    console.error('Error summarizing webpage:', error);
    return res.status(500).json({ 
      error: 'Failed to summarize webpage', 
      details: error.message 
    });
  }
};