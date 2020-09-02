import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer not found!');
    }

    const findProducts = await this.productsRepository.findAllById(products);

    if (!findProducts.length) {
      throw new AppError('Products not found');
    }

    const productsIds = findProducts.map(product => product.id);

    const inexistentProducts = products.filter(
      product => !productsIds.includes(product.id),
    );

    if (inexistentProducts.length) {
      throw new AppError(
        `Could not find product(s) ${inexistentProducts.map(
          product => product.id,
        )}`,
      );
    }

    const productsWithoutQuantityAvailable = products.filter(
      product =>
        findProducts.filter(p => p.id === product.id)[0].quantity <
        product.quantity,
    );

    if (productsWithoutQuantityAvailable.length) {
      throw new AppError(
        `The quantity ${productsWithoutQuantityAvailable.map(
          product => product.quantity,
        )} is not available for ${productsWithoutQuantityAvailable.map(
          product => product.id,
        )}`,
      );
    }

    const serializedProducts = products.map(product => {
      return {
        product_id: product.id,
        quantity: product.quantity,
        price: findProducts.filter(p => p.id === product.id)[0].price,
      };
    });

    const order = await this.ordersRepository.create({
      customer,
      products: serializedProducts,
    });

    const orderedProductsQuantity = products.map(product => ({
      id: product.id,
      quantity:
        findProducts.filter(p => p.id === product.id)[0].quantity -
        product.quantity,
    }));

    await this.productsRepository.updateQuantity(orderedProductsQuantity);

    return order;
  }
}

export default CreateOrderService;
