import DateUtils from '@utils/date.utils';

import { 
    connect, 
    connection,
    Schema, 
    model,
} from "mongoose";
import {Request, Response} from "express";  

export class ExerciseService {

    private userSchema: Schema<any> = new Schema(
        {name: {type: String, required: true}
    })

    private exerciseSchema: Schema<any> = new Schema({
        userId: { type: String, required: true },
        description: { type: String, required: true },
        duration: { type: Number, required: true },
        date: { type: Date, required: false }
    })

    private userModel = model("User", this.userSchema);
    private exerciseModel = model("Exercise", this.exerciseSchema);

    constructor(mongoURI: string) {
        connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true});
        console.info(this.getMongoDbConnectionStatus());
    }

    private getMongoDbConnectionStatus(): string{
        return `MongoDBConnectionState: ${connection.readyState}.`
    }
        
    public getUsers(_request: Request, response: Response): void {
        this.userModel.find({}, (err, data) => {
            if (err) {
                response.json({ error: "Internal server error" })
            }
            if (data) {
                response.json(data);
            } else {
                response.json({ msg: "Nothing on database" });
            }
        });
    }

    public async tryToCreateUser(request: Request, response: Response){
        let username: string = request.body.username;
        try {
            let data = await this.userModel.findOne({ name: username });
            if (data) {
                response.json({ error: `Username already taken` });
            } else {
                this.createUser(request, response);
            }
        } catch {
            console.error(`Error when searching user with username: ${username} on database.`);
        }
    }

    private async createUser(request: Request, response: Response) {
        let requestBody: CreateUserBody = {name: request.body.username};
        try {
            let data = await this.userModel.create(requestBody);
            response.json({name: data.eventNames, _id: data._id});
        } catch {
            console.error(`Error when creating user with username: ${requestBody.name}`)
        }
    }

    public async tryToCreateExercise(request: Request, response: Response){
        try {
            let user = await this.userModel.findById(request.body.userId);
            if (user) {
                this.createExercise(request, response);
            } else {
                response.json({ error: `Could not found any user with ID: ${request.body.userId}.` });
            }
        } catch {
            response.json({ error: `Error when creating exercise to user: ${request.body.userId}. Maybe it doesn't exist.` });
        }
    }

    private createExercise(request: Request, response: Response<any>) {
        let currentDate = new Date();
        if (DateUtils.isValidDate(request.body.date)) {
            currentDate = new Date(request.body.date);
        }

        let newExercise = {
            userId: request.body.userId,
            description: request.body.description,
            duration: request.body.duration,
            date: currentDate.toLocaleDateString()
        };

        this.exerciseModel.create(newExercise, (err: any, data: any) => {
            if (err) {
                response.json({ error: `Error when creating exercise to user: ${request.body.userId}. Maybe it doesn't exist.` });
            }
            return response.json(data);
        });
    }

    public getExerciseByUserID(request: Request, response: Response<any>) {
        let requestQuery: FindExerciseBody = {userId: String(request.query.userId), from: String(request.query.from), to: String(request.query.to), limit: Number(request.query.limit)}
        let isFromAndtoValid = DateUtils.isValidDate(requestQuery.from) && DateUtils.isValidDate(requestQuery.to)
        let isJustFromValid = DateUtils.isValidDate(requestQuery.from) && !DateUtils.isValidDate(requestQuery.to)
        let isJustToValid = !DateUtils.isValidDate(requestQuery.from) && DateUtils.isValidDate(requestQuery.to)

        let date = Date();
        let dbQuery = { userId: requestQuery.userId, date: {$gte: "2019-01-01", $lt: String(date)}}

        if (isFromAndtoValid) {
            dbQuery.date = { $gte: requestQuery.from, $lt: requestQuery.to }
        } else if (isJustFromValid) {
            dbQuery.date.$gte = requestQuery.from 
        } else if (isJustToValid) {
            dbQuery.date.$lt = requestQuery.to
        }

        this.findExerciseByUserId(dbQuery, response, requestQuery);
    } 

    private findExerciseByUserId(dbQuery: { userId: string; date: { $gte: string; $lt: string; }; }, response: Response<any>, requestQuery: FindExerciseBody) {
        this.exerciseModel.find(dbQuery, (err, data) => {
            if (err) {
                return response.json({ error: "Internal server error" });
            }
            if (data) {
                let limit = requestQuery.limit && requestQuery.limit > 0 ? requestQuery.limit : data.length;

                return response.json(data.slice(0, limit));
            } else {
                return response.json({ msg: "Nothing on database" });
            }
        });
    }
}