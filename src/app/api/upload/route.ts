import { method2 } from "@/lib/upload";
import type { NextApiRequest, NextApiResponse } from "next";

export async function POST(req: NextApiRequest, res: NextApiResponse) {
    method2(req, res);
    console.log(res);
    return res.status(200).json({ message: "ok" });
}

export const config = {
    api: {
        bodyParser: false,
    },
};
