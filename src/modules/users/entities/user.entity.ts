import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, DeleteDateColumn, OneToMany, Index,
  BeforeInsert, AfterLoad,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import * as bcrypt from 'bcrypt';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  SELLER = 'seller',
  BUYER = 'buyer',
}

registerEnumType(UserRole, { name: 'UserRole' });

// ✅ TypeORM Entity + GraphQL Type en même temps
@ObjectType()
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ length: 100 })
  firstName: string;

  @Field()
  @Column({ length: 100 })
  lastName: string;

  @Field()
  @Column({ unique: true })
  @Index()
  email: string;

  @Exclude() // ✅ class-transformer : jamais sérialisé
  @Column()
  password: string;

  @Field(() => UserRole)
  @Column({ type: 'enum', enum: UserRole, default: UserRole.BUYER })
  role: UserRole;

  @Field({ nullable: true })
  @Column({ nullable: true })
  avatar?: string;

  @Field()
  @Column({ default: false })
  isEmailVerified: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  googleId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  githubId?: string;

  @Exclude()
  @Column({ nullable: true })
  refreshTokenHash?: string;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @Column({ default: 'default' })
  tenantId: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn() // ✅ Soft delete
  deletedAt?: Date;

  // ✅ Lifecycle hook TypeORM
  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  // ✅ Computed property
  @Expose()
  @Field()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}