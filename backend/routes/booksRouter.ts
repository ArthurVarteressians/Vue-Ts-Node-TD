// routes/booksRouter.ts

import express, { Request, Response, RequestHandler } from 'express';
import Book from '../models/Book';
import { FilterQuery } from 'mongoose';

const router = express.Router();

// GET /books - Fetch paginated books with optional filters and sorting
const getBooksHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', title, category, author, sort = 'desc' } = req.query as {
      page?: string;
      title?: string;
      category?: string;
      author?: string;
      sort?: 'asc' | 'desc';
    };

    const limit = 6;
    const pageNumber = parseInt(page, 10);
    const skip = (pageNumber - 1) * limit;

    const query: FilterQuery<typeof Book> = {};
    if (title) query.title = { $regex: title, $options: 'i' };
    if (category) query.category = category;
    if (author) query.author = author;

    const sortOrder = sort === 'desc' ? -1 : 1;

    const books = await Book.find(query).sort({ _id: sortOrder }).skip(skip).limit(limit);
    const totalBooks = await Book.countDocuments(query);

    res.json({
      books,
      totalPages: Math.ceil(totalBooks / limit),
      currentPage: pageNumber,
      totalBooks,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books', error });
  }
};

// GET /books/filters - Fetch unique categories and authors
const getFiltersHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Book.distinct('category');
    const authors = await Book.distinct('author');

    res.json({ categories, authors });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching filters', error });
  }
};

// POST /books - Add a new book
const addBookHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, author, price, description, category } = req.body;

    // Create a new Book document
    const newBook = new Book({
      title,
      author,
      price,
      description,
      category,
    });

    await newBook.save();

    res.status(201).json({
      message: 'Book added successfully',
      book: newBook,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add book', error });
  }
};

// PUT /books/:id - Update book details
const updateBookHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, author, price, description, category } = req.body;

    const updatedBook = await Book.findByIdAndUpdate(
      id,
      { title, author, price, description, category },
      { new: true }
    );

    if (!updatedBook) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }

    res.json({ message: 'Book updated successfully', book: updatedBook });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update book', error });
  }
};

// DELETE /books/:id - Delete a book
const deleteBookHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deletedBook = await Book.findByIdAndDelete(id);

    if (!deletedBook) {
      res.status(404).json({ message: 'Book not found' });
      return;
    }

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete book', error });
  }
};

// Route definitions
router.get('/', getBooksHandler);
router.get('/filters', getFiltersHandler);
router.post('/', addBookHandler);
router.put('/:id', updateBookHandler);
router.delete('/:id', deleteBookHandler);

export default router;
