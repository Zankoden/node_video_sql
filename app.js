import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { getVideos, getVideoById, createVideo, updateVideoById, deleteVideoById } from "./database.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

// Use the cors middleware
app.use(cors({
    origin: true, // Replace with your React app's origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify the methods you need
    credentials: true, // If you need to include credentials like cookies in the request
}));

// Multer setup for video uploads
const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "video_uploads"));
    },
    filename: (req, file, cb) => {
        // Extracting the file extension
        const ext = path.extname(file.originalname);
        const fileName = `${Date.now()}${ext}`;
        cb(null, fileName);
    }
});



const upload = multer({ storage: videoStorage });

app.use('/video_uploads', express.static(path.join(__dirname, 'video_uploads')));

app.get("/videos", async (req, res) => {
    try {
        const videos = await getVideos();
        res.status(200).send(videos);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving videos");
    }
});

app.get("/videos/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const videoByID = await getVideoById(id);
        if (!videoByID) {
            return res.status(404).send(`Video with ID ${id} not found`);
        }
        res.status(200).send(videoByID);
    } catch (error) {
        console.error(error);
        res.status(500).send(`Error retrieving video with ID ${id}`);
    }
});

app.post("/createVideoWithFile", upload.single('video_path'), async (req, res) => {
    const { video_name, video_description, genre } = req.body;
    const video_path = req.file ? path.join('video_uploads', req.file.filename) : null;

    if (!video_name || !video_path) {
        return res.status(400).send("Video name and file are required");
    }

    try {
        const video = await createVideo(video_name, video_description, genre, video_path);
        res.status(201).send(video);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating video");
    }
});

app.put("/updateVideoById/:video_id", async (req, res) => {
    const video_id = req.params.video_id;
    const { video_name, video_description, genre } = req.body;
    
    if (!video_name && !video_description && !genre) {
        return res.status(400).send("No fields provided to update");
    }

    try {
        const result = await updateVideoById(video_name, video_description, genre, video_id);
        if (!result) {
            return res.status(404).send(`Video with ID ${video_id} not found`);
        }
        res.status(200).send(result);
    } catch (error) {
        console.error(`Error updating video with ID ${video_id}:`, error);
        res.status(500).send(`Error updating video with ID ${video_id}`);
    }
});

app.delete("/deleteVideoById/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const deleteVideo = await deleteVideoById(id);
        if (!deleteVideo.affectedRows) {
            return res.status(404).send(`Video with ID ${id} not found`);
        }
        res.status(200).send(`Video with ID ${id} deleted successfully`);
    } catch (error) {
        console.error(`Error deleting video with ID ${id}:`, error);
        res.status(500).send(`Error deleting video with ID ${id}`);
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke! 💩');
});

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});
