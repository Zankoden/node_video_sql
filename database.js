import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise();

export async function getVideos() {
    try {
        const [rows] = await pool.query("SELECT * FROM videos");
        return rows;
    } catch (error) {
        console.error("Error fetching videos:", error);
        throw new Error("Failed to fetch videos");
    }
}

export async function getVideoById(id) {
    try {
        const [rows] = await pool.query("SELECT * FROM videos WHERE video_id = ?", [id]);
        if (rows.length > 0) {
            return rows[0];
        } else {
            throw new Error(`Video with ID ${id} not found`);
        }
    } catch (error) {
        console.error(`Error fetching video with ID ${id}:`, error);
        throw new Error(`Failed to fetch video with ID ${id}`);
    }
}

export async function createVideo(video_name, video_description, genre, video_path) {
    try {
        const [resultCreate] = await pool.query(`
            INSERT INTO videos (video_name, video_description, genre, video_path)
            VALUES (?, ?, ?, ?)
        `, [video_name, video_description, genre, video_path]);
        
        const id = resultCreate.insertId;
        return getVideoById(id);
    } catch (error) {
        console.error("Error creating video:", error);
        throw new Error("Failed to create video");
    }
}

export async function updateVideoById(video_name, video_description, genre, video_id) {
    try {
        const [resultUpdate] = await pool.query(`
            UPDATE videos
            SET video_name = ?, video_description = ?, genre = ?
            WHERE video_id = ?
        `, [video_name, video_description, genre, video_id]);
        
        if (resultUpdate.affectedRows > 0) {
            return { message: `Video with ID ${video_id} updated successfully` };
        } else {
            throw new Error(`Video with ID ${video_id} not found`);
        }
    } catch (error) {
        console.error(`Error updating video with ID ${video_id}:`, error);
        throw new Error(`Failed to update video with ID ${video_id}`);
    }
}

export async function deleteVideoById(id) {
    try {
        const resultDelete = await pool.query("DELETE FROM videos WHERE video_id = ?", [id]);
        return resultDelete[0];
    } catch (error) {
        console.error(`Error deleting video with ID ${id}:`, error);
        throw new Error(`Failed to delete video with ID ${id}`);
    }
}
