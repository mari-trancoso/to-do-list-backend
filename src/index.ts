import express, { Request, Response } from 'express'
import cors from 'cors'
import { db } from './database/knex'

const app = express()

app.use(cors())
app.use(express.json())

app.listen(3003, () => {
    console.log(`Servidor rodando na porta ${3003}`)
})

app.get("/ping", async (req: Request, res: Response) => {
    try {
		const result = await db("users")
        res.status(200).send({ message: "Pong!", result })
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

//GET ALL USERS
app.get("/users", async (req: Request, res: Response) => {
    try {
        const searchTerm = req.query.q as string | undefined

        if(searchTerm === undefined){
            const result = await db("users")
            res.status(200).send(result)
        }else{
            const resultSearchTerm = await db("users").where("name", "LIKE", `%${searchTerm}%`)
            res.status(200).send(resultSearchTerm)
        }
		
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

//POST USER
app.post("/users", async (req: Request, res: Response) => {
    try {
        const {id, name, email, password} = req.body

        if(typeof id !== "string"){
            res.status(400)
            throw new Error("'id' deve ser string.")
        }
        if(id.length < 4){
            res.status(400)
            throw new Error("'id' deve possuir pelo menos 4 caracteres.")
        }
        if(typeof name !== "string"){
            res.status(400)
            throw new Error("'name' deve ser string.")
        }
        if(name.length < 2){
            res.status(400)
            throw new Error("'name' deve possuir pelo menos 2 caracteres.")
        }
        if(typeof email !== "string"){
            res.status(400)
            throw new Error("'email' deve ser string.")
        }
        if (!email.match(/^[a-zA-Z0-9.!#$%&'+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)$/g)) {
			throw new Error("'email' deve possuir entre 8 e 12 caracteres, com letras maiúsculas e minúsculas e no mínimo um número e um caractere especial")
		}
        if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,12}$/g)) {
			throw new Error("'password' deve possuir entre 8 e 12 caracteres, com letras maiúsculas e minúsculas e no mínimo um número e um caractere especial")
		}
        

        const [userIdAlreadyExist] = await db("users").where({id})
        if(userIdAlreadyExist){
            res.status(400)
            throw new Error("id já existe.")
        }

        const [userEmailAlreadyExist] = await db("users").where({email})
        if(userEmailAlreadyExist){
            res.status(400)
            throw new Error("email já existe.")
        }

        const newUser = {
            id,
            name,
            email, 
            password
        }

        await db("users").insert(newUser)
        res.status(201).send({
            message: "User criado com sucesso",
            user: newUser})
		
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})