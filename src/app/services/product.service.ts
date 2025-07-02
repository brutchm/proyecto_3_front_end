import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { Product } from "../interfaces/product.interface";
import { IResponse } from "../interfaces";
import { BaseService } from "./base-service";

@Injectable({ providedIn: "root" })
export class ProductService extends BaseService<Product> {
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

  constructor() {
    super();
    this.source = "products";
  }

  public loadProducts(): void {
    this.findAll().subscribe((res: IResponse<Product[]>) => {
      this.productsSubject.next(res.data);
    });
  }

  public createProduct(product: Product) {
    if (!product.categoryId) {
      throw new Error("categoryId is required to create product");
    }
    return this.addCustomSource(`product/${product.categoryId}`, product);
  }

  public updateProduct(id: number, product: Product) {
    return this.edit(id, product);
  }

  public deleteProduct(id: number) {
    return this.del(id);
  }


  public items$(): Observable<Product[]> {
    return this.products$;
  }
}
