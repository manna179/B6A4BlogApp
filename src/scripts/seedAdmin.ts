
import { prisma } from "../lib/prisma";
import { UserRole } from "../middlewares/auth";


async function seedAdmin() {
    try{
console.log("***** Admin seeding started.....");
        const adminData = {
            name:"hadisur2 rahman",
            email:"admin2@admin.com",
            role:UserRole.ADMIN,
            password:"admin1234",
         

        }
        console.log("checking Admin exist or not");
        // check user on db 
        const existingUser = await prisma.user.findUnique({
            where:{
                email:adminData.email
            }
        })

        if(existingUser){
            throw new Error("already exist the user try another one")
        }

        const signUpAdmin = await fetch("http://localhost:3000/api/auth/sign-up/email",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(adminData)
        })
       
        if(signUpAdmin.ok){
            console.log("Admin created");
           await prisma.user.update({
            where:{
                email : adminData.email
            },
            data:{
                emailVerified:true
            }
           })
           console.log("Email verification updated");
        }
        console.log("*****success****");
    }catch(err){
        console.log(err);
    }
}
seedAdmin()