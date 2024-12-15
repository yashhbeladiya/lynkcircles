//@ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Rating, 
  Box, 
  Typography 
} from '@mui/material';

const ReviewDialog = ({ 
  open, 
  onClose, 
  onSubmit, 
  initialReview = null 
}) => {
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);

  console.log('ReviewDialog -> initialReview', initialReview);

  // Reset form when dialog opens or initial review changes
  useEffect(() => {
    if (open && initialReview) {
      setReview(initialReview.text || '');
      setRating(initialReview.rating || 0);
    } else if (open) {
      // Reset to default values when opening new review
      setReview('');
      setRating(0);
    }
  }, [open, initialReview]);

  const handleSubmit = () => {
    // Validate before submission
    if (review.trim() === '') {
      alert('Please provide a review');
      return;
    }

    onSubmit({
      review: review.trim(),
      rating: rating
    });

    // Close dialog
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {initialReview ? 'Edit Review' : 'Add New Review'}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            multiline
            rows={4}
            fullWidth
            label="Your Review"
            variant="outlined"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Write your review here..."
          />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography component="legend">Rating</Typography>
            <Rating
              name="review-rating"
              value={rating}
              precision={0.5}
              onChange={(event, newValue) => {
                setRating(newValue || 0);
              }}
              size="large"
            />
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
        >
          {initialReview ? 'Update Review' : 'Submit Review'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewDialog;