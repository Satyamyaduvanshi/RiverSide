import { INestApplication, OnModuleInit } from "@nestjs/common";


export abstract class BasePrismaService implements OnModuleInit{

    abstract $connect():Promise<void>
    abstract $on(event:string,callback:()=>void):void;

    async onModuleInit() {
        await this.$connect()
    }

    async enableShutDownHook(app:INestApplication){
        this.$on('beforeExit',async()=>{
            await app.close();
        })
    }
}