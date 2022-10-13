import { Request, Response } from "express";

import { StatisticsService } from "../services/statistics-service";

export class StatisticsController {
    public static async getStatisticsForUser(
        request: Request,
        response: Response
    ): Promise<void> {
        const userID = request.params.userID;

        try {
            const statistics = await StatisticsService.getStatisticsForUser({
                userId: userID,
            });
            response.status(200).send({
                statistics: JSON.stringify(Array.from(statistics.entries())),
            });
        } catch (error) {
            response.status(500).send({ status: "Could not load statistics" });
        }
    }

    public static async getOverallStatistics(
        request: Request,
        response: Response
    ): Promise<void> {
        try {
            const statistics = await StatisticsService.getOverallStatistics();
            response.status(200).send({
                statistics: JSON.stringify(Array.from(statistics.entries())),
            });
        } catch (error) {
            console.log(error);
            response.status(500).send({ status: "Could not load statistics" });
        }
    }
}
