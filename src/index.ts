import express, { Request, Response } from "express";

const app = express();
const port = 8000;

app.get("/", (req: Request, res: Response) => {
    res.status(200).send({ status: "OK", statusCode: 200 });
});

app.listen(port, () => {
    console.log(`Server running at port ${port}`);
});
