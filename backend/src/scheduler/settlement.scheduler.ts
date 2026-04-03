import cron from "node-cron";
import { prisma } from "../infra/prisma";
import { settleMerchant } from "../admin/admin.service";

export function startSettlementJob(){
    cron.schedule("0 0 * * *", async () =>{    // for testing, you can change the schedule to "*/1 * * * *" to run every minute
        console.log("Running settlement job at", new Date().toISOString());
        const merchants = await prisma.merchant.findMany();

        for(const merchant of merchants){
            const result = await settleMerchant(merchant.id);
            if (result.status === "SETTLED")
            console.log(`Settled merchant ${merchant.name} successfully`);
        }
    });
}