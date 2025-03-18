const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const ollamaService = require('../services/ollamaService');

// Store document content in memory (use DB in production)
const documentStore = {};

// Upload document
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const file = req.file;
    const filePath = file.path;
    let documentContent = '';

    // Extract text based on file type
    if (file.mimetype === 'application/pdf') {
      const pdfData = await pdfParse(fs.readFileSync(filePath));
      documentContent = pdfData.text;
    } else if (file.mimetype === 'text/plain') {
      documentContent = fs.readFileSync(filePath, 'utf8');
    } else {
      return res.status(400).json({ error: 'Only PDF or TXT files are supported' });
    }

    // Store document content
    const documentId = file.filename;
    documentStore[documentId] = { 
      content: documentContent, 
      filename: file.originalname,
      path: filePath
    };

    console.log(`Document uploaded: ${documentId}, content length: ${documentContent.length} chars`);

    return res.status(200).json({ 
      message: 'Document uploaded successfully', 
      documentId 
    });
  } catch (error) {
    console.error('Upload Error:', error);
    return res.status(500).json({ error: 'Failed to upload document' });
  }
};

// Analyze document
exports.analyzeDocument = async (req, res) => {
  try {
    const { documentId } = req.body;
    if (!documentId || !documentStore[documentId]) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    const documentContent = documentStore[documentId].content;
    const filename = documentStore[documentId].filename;
    
    // Limit content length to avoid overwhelming the model
    const contentForAnalysis = documentContent.length > 10000 
      ? documentContent.substring(0, 10000) + "..." 
      : documentContent;
    
    const prompt = `You are a document analysis assistant. 
    Analyze the following document titled "${filename}":

    ${contentForAnalysis}

    Provide:
    1. A concise summary of the document's content
    2. Main topics covered
    3. Key points or insights
    4. Document structure analysis
    
    Format your response using markdown.`;

    console.log(`Analyzing document: ${documentId}`);
    const analysis = await ollamaService.generateText(prompt, 'gemma');
    
    return res.status(200).json({ analysis });
  } catch (error) {
    console.error('Analysis Error:', error);
    return res.status(500).json({ error: 'Failed to analyze document' });
  }
};

// Answer question based on document
exports.answerQuestion = async (req, res) => {
  try {
    const { documentId, question } = req.body;
    
    if (!documentId || !documentStore[documentId]) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }
    
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const documentContent = documentStore[documentId].content;
    
    // Limit content length to avoid overwhelming the model
    const contentForQuestion = documentContent.length > 10000 
      ? documentContent.substring(0, 10000) + "..." 
      : documentContent;
    
    const prompt = `You are a document Q&A assistant. I'll provide you with a document and a question about it.
    
    Document content:
    """
    ${contentForQuestion}
    """
    
    Question: ${question}
    
    Answer the question based only on the information provided in the document. 
    If the document doesn't contain relevant information to answer the question, 
    say "I don't have enough information in the document to answer this question" instead of making up an answer.
    
    Format your response using markdown.`;

    console.log(`Question about document ${documentId}: ${question}`);
    const answer = await ollamaService.generateText(prompt, 'gemma');
    
    return res.status(200).json({ answer });
  } catch (error) {
    console.error('Question Error:', error);
    return res.status(500).json({ error: 'Failed to answer question' });
  }
};