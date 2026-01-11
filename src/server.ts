import app from "./app";
import { prisma } from "./lib/prisma";


const PORT = process.env.PORT || 3000;

async function main() {
    try{
await prisma.$connect();
console.log("connected to the database successfully");
app.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT}`);
})
    }catch(error:any){
        console.log("an error occurred", error.message);
        await prisma.$disconnect();
        process.exit(1)
    }
}
main()