import dotenv from "dotenv";
dotenv.config();
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

const refreshToken = async (req, res) => {
    try {

        // Cek apakah refresh token ada di cookies
        const refreshToken = req.cookies.refreshToken;
        console.log({ refreshToken })

        // Jika tidak ada, kirim status 401
        if (!refreshToken) return res.sendStatus(401);
        console.log("sudah lewat 401 di authcontroller")

        // Cari user berdasarkan refresh token
        const user = await User.findOne({
            where: { refreshToken }
        });
        // Jika refresh token tidak ada di database, kirim 403
        if (!user.refreshToken) return res.sendStatus(403);

        // Jika refresh token ada, verifikasi token
        else jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY, (err, decoded) => {
            
            // Jika token tidak valid, kirim 403
            if (err) return res.sendStatus(403);
            console.log("sudah lewat 403 ke dua di controller")

            // Konversi user ke JSON (objek) dan disimpan ke variabel userPlain
            const userPlain = user.toJSON();

            // Membuat objek baru (safeUserData) yang berisi semua properti dari userPlain
            // kecuali 'password' dan 'refreshToken'
            const { password: _, refreshToken: __, ...safeUserData } = userPlain;

            // Buat access token baru
            const accessToken = jwt.sign(safeUserData, process.env.ACCESS_SECRET_KEY, {
                expiresIn: '30s'
            });

            // Kirim access token baru ke client
            res.json({ accessToken });
        });
    } catch (error) {
        console.log(error);
    }
}

export default refreshToken;