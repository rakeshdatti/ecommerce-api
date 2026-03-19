import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

import { pool } from "../config/db.js"


const register=async(req,res) =>{
    const {name,email,password}=req.body

    try{
        const [existing]=await pool.query('SELECT ID FROM USERS WHERE EMAIL=?',[email]);
        if(existing.length>0){
            return res.status(409).json({
                success:false,
                message: "Email is already registered"
            })
        }

        const hashedpassword=await bcrypt.hash(password,2)

        const walletPoints=Number(process.env.NEW_USER_WALLET_POINTS) 

        const [result]=await pool.query('INSERT INTO USERS (NAME,EMAIL,PASSWORD,WALLET_POINTS) VALUES (?,?,?,?)',[name,email,hashedpassword,walletPoints])

        return res.status(201).json({
            success: true,
            message: `Registered successfully! you received ${walletPoints} wallet points`,
            user:{
                id: result.insertId,
                name,
                email,
                wallet_points: walletPoints
            },
        })

    }catch(err){
        console.log("Register error",err)
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
}


const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = users[0];


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN  }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        wallet_points: user.wallet_points,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

export {register,login}