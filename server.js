import express from "express"
import cors from "cors"
import{ DBConn} from "./src/config/db.js";
import "dotenv/config"
import authRoute from "./src/routes/authRoute.js"
import productRoutes from './src/routes/productRoutes.js';
import cartRoutes from './src/routes/cartRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';

const app=express()

const PORT=process.env.PORT

//middlware
app.use(cors())
app.use(express.json())


app.get("/",(req,res)=>{
    res.json({
        success: true,
        message: "Ecommerece api is running "
    })
})

app.use('/api/auth', authRoute);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders',orderRoutes)
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found.` });
});


DBConn().then(()=>{
    app.listen(PORT,()=>{
        console.log(`server running at http://localhost:${PORT}`);
    })
})

