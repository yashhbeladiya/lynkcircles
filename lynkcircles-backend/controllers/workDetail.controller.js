import WorkDetail from "../models/workdetail.model.js";
import JobPortfolio from "../models/jobportfolio.model.js";
import User from "../models/user.model.js";

export const createWorkDetail = async (req, res) => {
    try {
        const { serviceOffered, description, hourlyRate, availability } = req.body;
        const newWorkDetail = new WorkDetail({
        user: req.user._id,
        description,
        serviceOffered,
        hourlyRate,
        availability,
        });
        await newWorkDetail.save();
        res.status(201).json({ message: "Work detail created successfully" });
    } catch (error) {
        console.log("Error in createWorkDetail: ", error.message);
        res.status(500).json({ message: "Server error" });
    }
    };

export const getWorkDetails = async (req, res) => {
    try {
        // Find the work details of username from url
        const user = await User.findOne({ username: req.params.username });

        const workDetails = await WorkDetail.find({ user: user._id }).populate("user", "firstName lastName headline profilePicture").populate("reviews.reviewer", "firstName lastName profilePicture");
        
        if (!workDetails) {
            return res.status(404).json({ message: "Work details not found" });
        }
        
        workDetails.forEach((workDetail) => {
            workDetail.ratings = workDetail.reviews.map((review) => review.rating).reduce((a, b) => a + b, 0) / workDetail.reviews.length;
        });

        res.status(200).json(workDetails);
    } catch (error) {
        console.log("Error in getWorkDetail: ", error.message);
        res.status(500).json({ message: "Server error" });
    }
}

export const updateWorkDetail = async (req, res) => {
    try {
        const workDetail = await WorkDetail.findOne({ user: req.user._id });
        if (!workDetail) {
            return res.status(404).json({ message: "Work detail not found" });
        }
        workDetail.serviceOffered = req.body.serviceOffered;
        workDetail.description = req.body.description;
        workDetail.hourlyRate = req.body.hourlyRate;
        workDetail.availability = req.body.availability;
        await workDetail.save();
        res.status(200).json({ message: "Work detail updated successfully" });
    } catch (error) {
        console.log("Error in updateWorkDetail: ", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteWorkDetail = async (req, res) => {
    try {
        await WorkDetail.findOneAndDelete({ user: req.user._id });
        res.status(200).json({ message: "Work detail deleted successfully" });
    } catch (error) {
        console.log("Error in deleteWorkDetail: ", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteWorkDetailbyId = async (req, res) => {
    try {
        await WorkDetail.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Work detail deleted successfully" });
    } catch (error) {
        console.log("Error in deleteWorkDetailbyId: ", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const getWorkDetailsbyId = async (req, res) => {
    try {
        const workDetail = await WorkDetail.findById(req.params.id).populate("user", "firstName lastName headline profilePicture").populate("reviews.reviewer", "firstName lastName profilePicture");

        // get rating from reviews and calculate average
        workDetail.ratings = workDetail.reviews.map((review) => review.rating).reduce((a, b) => a + b, 0) / workDetail.reviews.length;

        if (!workDetail) {
            return res.status(404).json({ message: "Work detail not found" });
        }
        res.status(200).json(workDetail);
    }
    catch (error) {
        console.log("Error in getWorkDetailsbyId: ", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const getJobPortfolioForService = async (req, res) => {
    try {
        const jobPortfolio = await JobPortfolio.find({ service: req.params.serviceId });
        if (!jobPortfolio) {
            return res.status(404).json({ message: "Job Portfolio not found" });
        }
        res.status(200).json(jobPortfolio);
    } catch (error) {
        console.log("Error in getJobPortfolioForService: ", error.message);
        res.status(500).json({ message: "Server error" });
    }
}

export const createJobPortfolio = async (req, res) => {
    try {
        console.log("Create job portfolio");
        const {
            service,
            jobTitle,
            description,
            images, // Base64 strings or URLs
            videos, // Base64 strings or URLs
            dateCompleted,
            clientUsername,
            clientName,
            reviews
        } = req.body;

        const newJobPortfolio = new JobPortfolio({
            user: req.user._id,
            service,
            jobTitle,
            description,
            images,
            videos,
            dateCompleted,
            clientUsername,
            clientName,
            reviews,
        });

        console.log("images type: ", typeof images);

        await newJobPortfolio.save();
        res.status(201).json({ message: "Job Portfolio created successfully" });
    } catch (error) {
        console.log("Error in createJobPortfolio: ", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const getJobPortfolioById = async (req, res) => {
    try {
        const jobPortfolio = await JobPortfolio.findById(req.params.id);
        if (!jobPortfolio) {
            return res.status(404).json({ message: "Job Portfolio not found" });
        }
        res.status(200).json(jobPortfolio);
    } catch (error) {
        console.log("Error in getJobPortfolioById: ", error.message);
        res.status(500).json({ message: "Server error" });
    }
}

export const updateJobPortfolio = async (req, res) => {
    try {
        const jobPortfolio = await JobPortfolio.findById(req.params.id);
        if (!jobPortfolio) {
            return res.status(404).json({ message: "Job Portfolio not found" });
        }

        const {
            jobTitle,
            description,
            images, // Updated images
            videos, // Updated videos
            dateCompleted,
            clientUsername,
            clientName,
            reviews,
        } = req.body;

        jobPortfolio.jobTitle = jobTitle;
        jobPortfolio.description = description;
        jobPortfolio.images = images;
        jobPortfolio.videos = videos;
        jobPortfolio.dateCompleted = dateCompleted;
        jobPortfolio.clientUsername = clientUsername;
        jobPortfolio.clientName = clientName;
        jobPortfolio.reviews = reviews;

        await jobPortfolio.save();
        res.status(200).json({ message: "Job Portfolio updated successfully" });
    } catch (error) {
        console.log("Error in updateJobPortfolio: ", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteJobPortfolio = async (req, res) => {
    try {
        await JobPortfolio.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Job Portfolio deleted successfully" });
    } catch (error) {
        console.log("Error in deleteJobPortfolio: ", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const createReview = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { review, rating } = req.body;
        const newReview = {
            reviewer: req.user._id,
            review,
            rating,
        };

        const workDetail = await WorkDetail.findById(serviceId);

        if (!workDetail) {
            return res.status(404).json({ message: "Work detail not found" });
        }

        workDetail.reviews.push(newReview);

        await workDetail.save();
        res.status(201).json({ message: "Review created successfully" });
    } catch (error) {
        console.log("Error in createReview: ", error.message);
        res.status(500).json({ message: "Server error" });
    }
}

export const updateReview = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { review, rating } = req.body;
        const updatedReview = {
            reviewer: req.user._id,
            review,
            rating,
        };

        const workDetail = await WorkDetail.findOne({ _id: serviceId, "reviews.reviewer": req.user._id });

        if (!workDetail) {
            return res.status(404).json({ message: "Review not found" });
        };

        const reviewIndex = workDetail.reviews.findIndex((review) => review.reviewer.toString() === req.user._id.toString());
        workDetail.reviews[reviewIndex] = updatedReview;

        await workDetail.save();
        res.status(200).json({ message: "Review updated successfully" });
    }
    catch (error) {
        console.log("Error in updateReview: ", error.message);
        res.status(500).json({ message: "Server error" });
    }

}

export const deleteReview = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const workDetail = await WorkDetail.findOne({ _id: serviceId, "reviews.reviewer": req.user._id });

        if (!workDetail) {
            return res.status(404).json({ message: "Review not found" });
        }

        workDetail.reviews = workDetail.reviews.filter((review) => review.reviewer.toString() !== req.user._id.toString());

        await workDetail.save();
        res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        console.log("Error in deleteReview: ", error.message);
        res.status(500).json({ message: "Server error" });
    }
}

export const getReview = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const workDetail = await WorkDetail.findById(serviceId);
        if (!workDetail) {
            return res.status(404).json({ message: "Work detail not found" });
        }
        res.status(200).json(workDetail.reviews);
    }
    catch (error) {
        console.log("Error in getReview: ", error.message);
        res.status(500).json({ message: "Server error" });
    }
}

export const getReviewById = async (req, res) => {
    try {
        const { serviceId, reviewerId } = req.params;
        const workDetail = await WorkDetail.findById(serviceId);
        if (!workDetail) {
            return res.status(404).json({ message: "Work detail not found" });
        }
        const review = workDetail.reviews.find((review) => review.reviewer.toString() === reviewerId);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        res.status(200).json(review);
    } catch (error) {
        console.log("Error in getReviewById: ", error.message);
        res.status(500).json({ message: "Server error" });
    }
}


        


