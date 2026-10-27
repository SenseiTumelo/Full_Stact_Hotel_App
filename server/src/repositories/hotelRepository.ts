import {pool} from "../config/db";

export async function findAllHotels(){
    const  result = await pool.query(
        'SELECT id, name, city, country, star_rating FROM  hotels ORDER BY name'
    );
    return result.rows;
}