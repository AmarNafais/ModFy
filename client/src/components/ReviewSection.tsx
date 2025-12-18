import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface ReviewSectionProps {
    productId: string;
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
    const { isAuthenticated, user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [showReviewForm, setShowReviewForm] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [title, setTitle] = useState("");
    const [comment, setComment] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: [`/api/products/${productId}/reviews`],
    });

    const reviews = data?.reviews || [];
    const ratingData = data?.rating || { averageRating: 0, totalReviews: 0 };

    const createReviewMutation = useMutation({
        mutationFn: async (reviewData: any) => {
            return apiRequest("POST", `/api/products/${productId}/reviews`, reviewData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/reviews`] });
            toast({
                title: "Review submitted",
                description: "Thank you for your review!",
            });
            setShowReviewForm(false);
            setRating(0);
            setTitle("");
            setComment("");
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to submit review",
                variant: "destructive",
            });
        },
    });

    const deleteReviewMutation = useMutation({
        mutationFn: async (reviewId: string) => {
            return apiRequest("DELETE", `/api/products/${productId}/reviews/${reviewId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/reviews`] });
            toast({
                title: "Review deleted",
                description: "Your review has been removed.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: "Failed to delete review",
                variant: "destructive",
            });
        },
    });

    const handleSubmitReview = () => {
        if (rating === 0) {
            toast({
                title: "Rating required",
                description: "Please select a rating",
                variant: "destructive",
            });
            return;
        }

        createReviewMutation.mutate({ rating, title, comment });
    };

    const renderStars = (value: number, interactive = false) => {
        return (
            <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        disabled={!interactive}
                        onClick={() => interactive && setRating(star)}
                        onMouseEnter={() => interactive && setHoveredRating(star)}
                        onMouseLeave={() => interactive && setHoveredRating(0)}
                        className={`${interactive ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                        <Star
                            size={interactive ? 24 : 16}
                            className={`${star <= (interactive ? (hoveredRating || rating) : value)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                                } transition-colors`}
                        />
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="mt-16 border-t border-luxury-muted pt-16">
            <h2 className="text-2xl font-light tracking-wide mb-8">CUSTOMER REVIEWS</h2>

            {/* Rating Summary */}
            <div className="flex items-center space-x-8 mb-12">
                <div className="text-center">
                    <div className="text-4xl font-light mb-2">
                        {ratingData.averageRating > 0 ? ratingData.averageRating.toFixed(1) : "No ratings"}
                    </div>
                    {ratingData.averageRating > 0 && (
                        <>
                            {renderStars(ratingData.averageRating)}
                            <div className="text-sm text-gray-600 mt-2">
                                Based on {ratingData.totalReviews} review{ratingData.totalReviews !== 1 ? 's' : ''}
                            </div>
                        </>
                    )}
                </div>

                {isAuthenticated && (
                    <Button
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="bg-luxury-black text-white hover:bg-gray-800"
                    >
                        {showReviewForm ? 'Cancel' : 'Write a Review'}
                    </Button>
                )}
            </div>

            {/* Review Form */}
            {showReviewForm && (
                <div className="mb-12 p-6 border border-luxury-muted rounded-sm">
                    <h3 className="text-lg font-medium mb-4">Write Your Review</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Rating *</label>
                            {renderStars(rating, true)}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Review Title</label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Summarize your experience"
                                maxLength={100}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Review</label>
                            <Textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your thoughts about this product"
                                rows={4}
                                maxLength={500}
                            />
                        </div>

                        <Button
                            onClick={handleSubmitReview}
                            disabled={createReviewMutation.isPending}
                            className="bg-luxury-black text-white hover:bg-gray-800"
                        >
                            {createReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                        </Button>
                    </div>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-8">
                {isLoading ? (
                    <p className="text-gray-600">Loading reviews...</p>
                ) : reviews.length === 0 ? (
                    <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
                ) : (
                    reviews.map((review: any) => (
                        <div key={review.id} className="border-b border-luxury-muted pb-8">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <div className="flex items-center space-x-2 mb-1">
                                        {renderStars(review.rating)}
                                        {review.isVerifiedPurchase && (
                                            <span className="text-xs text-green-600 font-medium">Verified Purchase</span>
                                        )}
                                    </div>
                                    {review.title && (
                                        <h4 className="font-medium text-sm mb-1">{review.title}</h4>
                                    )}
                                    <p className="text-xs text-gray-600">
                                        By {review.user.firstName} {review.user.lastName} on{' '}
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                {(review.userId === user?.id || (!review.userId && review.sessionId)) && (
                                    <button
                                        onClick={() => deleteReviewMutation.mutate(review.id)}
                                        disabled={deleteReviewMutation.isPending}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                        title="Delete review"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                            {review.comment && (
                                <p className="text-sm text-gray-700 mt-2">{review.comment}</p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
