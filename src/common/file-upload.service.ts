import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { S3 } from 'aws-sdk';
import * as path from 'path';
import { messages } from "./messages";

const bucket = {
    bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
    prefix: process.env.AWS_BUCKET_PREFIX
}

@Injectable()
export class FileUploadService {
    constructor() { }

    async singleFileUpload(File: Express.Multer.File, Path: string): Promise<any> {
        try {
            const name = File.originalname.split('.')[0];
            const fileExtName = path.extname(File.originalname);
            const time = new Date().getTime();
            const s3 = new S3();
            const Result = await s3
                .upload({
                    Bucket: bucket.bucket,
                    Body: File.buffer,
                    Key: bucket.prefix + Path + name + '-' + time + fileExtName,
                }).promise();
            return { url: Result.Location, key: Result.Key }
        }
        catch (error) {
            throw new InternalServerErrorException(error)
        }
    }

    async multiFileUpload(Files: Express.Multer.File[], Path: string) {
        let Url = [];
        let Key = [];
        for (let index = 0; index < Files.length; index++) {
            const name = Files[index].originalname.split('.')[0];
            const fileExtName = path.extname(Files[index].originalname);
            const time = new Date().getTime();
            const s3 = new S3();
            const Result = await s3
                .upload({
                    Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
                    Body: Files[0].buffer,
                    Key: bucket.prefix + Path + name + '-' + time + fileExtName,
                }).promise();
            Url.push(Result.Location)
            Key.push(Result.Key);
        }
        return { url: Url, key: Key }
    }


    async uploadFiles(files: Express.Multer.File[]): Promise<any> {
        try {
            const file_url = await this.multiFileUpload(files, '/image')
            return { message: messages.upload, data: file_url.url }
        }
        catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async uploadFile(File: Express.Multer.File): Promise<any> {
        try {
            const file_url = await this.singleFileUpload(File, '/image')
            return { message: messages.upload, data: file_url.url }
        }
        catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async uploadMultiFileGeneric(
        files: Express.Multer.File[],
        file_path: string,
    ) {
        try {
            let file_urls: string[] = [];
            let file_keys: string[] = [];
            for (let index = 0; index < files.length; index++) {
                const file = files[index];
                const name = file.originalname.split('.')[0];
                const fileExtName = path.extname(file.originalname);
                const time = new Date().getTime();
                const s3 = new S3();
                const uploadResult = await s3
                    .upload({
                        Bucket: bucket.bucket,
                        Body: file.buffer,
                        Key: bucket.prefix + file_path + name + '-' + time + fileExtName,
                    })
                    .promise();
                file_urls.push(uploadResult.Location);
                file_keys.push(uploadResult.Key);
            }
            return { url: file_urls, key: file_keys };
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}