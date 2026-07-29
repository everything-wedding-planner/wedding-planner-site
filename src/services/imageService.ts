import { ImageModel, IMAGE_FOLDER, ImageRow } from "../models/ImageModel";
import type { D1Database, R2Bucket } from "@cloudflare/workers-types";
import type { Env } from "../env";
import { CompanyServiceTypes } from "../models/companyModel";
import { ImageResponseDTO, toImageResponseDTO } from "../DTO/imageDTO";

export class ImageService {
  private imageModel: ImageModel;
  private r2Bucket: R2Bucket;
  private db: D1Database;

  constructor(db: D1Database, r2Bucket: R2Bucket) {
    this.db = db;
    this.imageModel = new ImageModel(db);
    this.r2Bucket = r2Bucket;
  }

  async storeImage(
    file: File,
    referenceType: (typeof CompanyServiceTypes)[keyof typeof CompanyServiceTypes],
    referenceId: number,
  ): Promise<string> {
    // Store the image in R2
    const extension = file.name.split(".").pop() || "jpg"; // Default to jpg if no extension
    const imageName = `${referenceType}_${referenceId}_${Date.now()}.${extension}`;
    const imagePath = `${IMAGE_FOLDER}${imageName}`;
    console.log(extension, imageName, imagePath);
    const arrayBuffer = await file.arrayBuffer();

    const imageResult = await this.r2Bucket.put(imagePath, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    console.log(imageResult);

    if (!imageResult) {
      throw new Error("Failed to store image in R2");
    }

    return imagePath;
  }

  async createImageModel(
    file: File,
    referenceType: (typeof CompanyServiceTypes)[keyof typeof CompanyServiceTypes],
    referenceId: number,
    alternativeText: string | null,
  ): Promise<boolean> {
    const imagePath = await this.storeImage(file, referenceType, referenceId);
    const extension = file.name.split(".").pop() || "jpg"; // Default to jpg if no extension
    return this.imageModel.createImage(
      imagePath,
      referenceType,
      referenceId,
      alternativeText,
      extension,
    );
  }

  async getImagesByReference(
    referenceType: (typeof CompanyServiceTypes)[keyof typeof CompanyServiceTypes],
    referenceId: number,
  ): Promise<ImageResponseDTO[]> {
    const imageRowList = await this.imageModel.getImagesByReference(
      referenceType,
      referenceId,
    );

    const imageResponseList = await Promise.all(
      imageRowList.map(async (imageRow) => {
        const imageResponseDTO = await toImageResponseDTO(imageRow, this.db);
        return imageResponseDTO;
      }),
    );
    return imageResponseList;
  }

  async deleteImage(id: number): Promise<boolean> {
    return this.imageModel.deleteImage(id);
  }

  async reorderImages(
    referenceType: (typeof CompanyServiceTypes)[keyof typeof CompanyServiceTypes],
    referenceId: number,
    items: { id: number; display_order: number }[],
  ): Promise<boolean> {
    return this.imageModel.reorderImages(referenceType, referenceId, items);
  }

  async getImageById(id: number): Promise<ImageResponseDTO | null> {
    const imageRow = await this.imageModel.getImageById(id);
    if (!imageRow) {
      return null;
    }
    return toImageResponseDTO(imageRow, this.db);
  }
}
