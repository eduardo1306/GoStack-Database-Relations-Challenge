import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export default class CreateRelationsWithOrderProductsOrderProduct1598579651161
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('order-product', [
      new TableColumn({
        name: 'product_id',
        type: 'uuid',
        isNullable: true,
      }),
      new TableColumn({
        name: 'order_id',
        type: 'uuid',
        isNullable: true,
      }),
    ]);

    await queryRunner.createForeignKeys('order-products', [
      new TableForeignKey({
        name: 'OrderProducts-Product',
        columnNames: ['product_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'product',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'OrderProducts-Order',
        columnNames: ['order_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'order',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('order-product', 'OrderProducts-Order');
    await queryRunner.dropColumn('order-product', 'order_id');
    await queryRunner.dropForeignKey('order-product', 'OrderProducts-Product');
    await queryRunner.dropColumn('order-product', 'product_id');
  }
}
