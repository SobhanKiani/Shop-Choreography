import { Test } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { ClientProxy, ClientsModule } from '@nestjs/microservices';
import { Prisma } from '@prisma/client';
import { IAdminToUserEvent, IUserAuthReponse, IUserDeletedEvent, IUserResponse, IUserToAdminEvent, Subjects } from '@sobhankiani/shopc-common-lib';
import { UserController } from './user.controller';
import { UserService } from './../../services/user-services/user.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JWT_CONSTANT } from './../../jwt/constants';
import { UserRepository } from './../../repositories/user.repository';
import { PrismaService } from './../../services/prisma-service/prisma-service.service';
import { clientProxyMock } from '../../../test/mocks/client-proxy.mock';
import { ROLE_ENUM } from './../../util/enums';
import { UserEntity } from 'entities/user/user.entity'


describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;
  let natsClient: ClientProxy;
  let jwtService: JwtService

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: JWT_CONSTANT.secret,
          signOptions: {
            expiresIn: '30d',
          },
        }),
        ClientsModule,
      ],
      controllers: [UserController],
      providers: [
        UserService,
        JwtService,

        UserRepository,
        PrismaService,
        {
          provide: "NATS_SERVICE",
          useValue: clientProxyMock,
        },
      ],
      exports: []
    }).compile();

    userController = moduleRef.get<UserController>(UserController);
    userService = moduleRef.get<UserService>(UserService);
    natsClient = moduleRef.get<ClientProxy>('NATS_SERVICE');
    jwtService = moduleRef.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    const createUserParams: Prisma.UserCreateInput = {
      email: 'test@example.com',
      password: 'test123',
      name: "test_name",
      address: 'test_address',
      phone: '09111111111'
    };


    const createdUser: UserEntity = new UserEntity(
      'user-id',
      'John Doe',
      'test@example.com',
      'test123',
      '123 Main St',
      '1234567890',
      ['user'],
      true,
      0
    );

    const signUpResponse: IUserAuthReponse = {
      message: 'Sign Up Completed',
      status: HttpStatus.CREATED,
      errors: null,
      data: {
        token: 'auth-token',
        user: createdUser.toObject(),
      },
    };

    it('should create a new user and return authentication data', async () => {
      jest.spyOn(userService, 'signUp').mockResolvedValueOnce({ userEntity: createdUser, token: 'auth-token' });
      const emitSpy = jest.spyOn(natsClient, 'emit');

      const result = await userController.signUp(createUserParams);

      expect(userService.signUp).toHaveBeenCalledWith(createUserParams);
      expect(emitSpy).toHaveBeenCalledWith(Subjects.UserCreated, {
        subject: Subjects.UserCreated,
        data: createdUser.toObject(),
      });
      expect(result).toEqual(signUpResponse);
    });

    it('should return an error response if user creation fails', async () => {
      jest.spyOn(userService, 'signUp').mockResolvedValueOnce(null);

      const result = await userController.signUp(createUserParams);

      expect(userService.signUp).toHaveBeenCalledWith(createUserParams);
      expect(result).toEqual({
        message: 'Could Not Complete The Operation',
        status: HttpStatus.BAD_REQUEST,
        errors: ['Could Not Create User'],
        data: null,
      });
    });

    it('should return an error response if an exception occurs', async () => {
      jest.spyOn(userService, 'signUp').mockRejectedValueOnce(new Error('Some error'));

      const result = await userController.signUp(createUserParams);

      expect(userService.signUp).toHaveBeenCalledWith(createUserParams);
      expect(result).toEqual({
        message: 'Could Not Complete The Operation',
        status: HttpStatus.BAD_REQUEST,
        errors: ['Could Not Complete The Operation'],
        data: null,
      });
    });
  });

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'test123',
    };

    const loginUser = new UserEntity(
      'user-id',
      "test_name",
      'test@example.com',
      'test123',
      'test_address',
      '09111111111',
      ['USER'],
      true,
      1
    )

    const loginResponse: IUserAuthReponse = {
      message: 'Login Successful',
      status: HttpStatus.OK,
      errors: null,
      data: {
        token: 'auth-token',
        user: loginUser.toObject(),
      },
    };

    it('should return authentication data if login is successful', async () => {
      jest.spyOn(userService, 'login').mockResolvedValueOnce({ userEntity: loginUser, token: 'auth-token' });

      const result = await userController.login(loginData);

      expect(userService.login).toHaveBeenCalledWith(loginData);
      expect(result).toEqual(loginResponse);
    });

    it('should return an error response if login fails', async () => {
      jest.spyOn(userService, 'login').mockResolvedValueOnce(null);

      const result = await userController.login(loginData);

      expect(userService.login).toHaveBeenCalledWith(loginData);
      expect(result).toEqual({
        message: 'Email Or Password Is Not Correct',
        status: HttpStatus.UNAUTHORIZED,
        errors: ['Could Not Login'],
        data: null,
      });
    });

    it('should return an error response if an exception occurs', async () => {
      jest.spyOn(userService, 'login').mockRejectedValueOnce(new Error('Some error'));

      const result = await userController.login(loginData);

      expect(userService.login).toHaveBeenCalledWith(loginData);
      expect(result).toEqual({
        message: 'Could Not Complete The Operation',
        status: HttpStatus.BAD_REQUEST,
        errors: ['Could Not Complete The Operation'],
        data: null,
      });
    });
  });

  describe('updateUser', () => {
    const userId = 'user-id';
    const updateData: Prisma.UserUpdateInput = {
      name: 'John Doe',
      address: '123 Main St',
      phone: '1234567890',
    };

    const updatedUser = new UserEntity(
      userId,
      'John Doe',
      "test@example.com",
      'pass1234',
      '123 Main St',
      '1234567890',
      ['USER'],
      true,
      1
    )

    const updateResponse = {
      message: 'User Updated Successfully',
      status: HttpStatus.OK,
      errors: null,
      data: updatedUser.toObject(),
    };

    it('should update the user and return the updated user data', async () => {
      jest.spyOn(userService, 'updateUser').mockResolvedValueOnce(updatedUser);
      const emitSpy = jest.spyOn(natsClient, 'emit');

      const result = await userController.updateUser({ id: userId, updateData });
      expect(userService.updateUser).toHaveBeenCalledWith(userId, updateData);
      expect(emitSpy).toHaveBeenCalledWith(Subjects.UserUpdated, {
        subject: Subjects.UserUpdated,
        data: {
          id: userId,
          name: 'John Doe',
          email: "test@example.com",
          address: '123 Main St',
          phone: '1234567890',
          roles: ['USER'],
          isActive: true,
          version: 1
        }
      });
      expect(result).toEqual(updateResponse);
    });

    it('should return an error response if user update fails', async () => {
      jest.spyOn(userService, 'updateUser').mockResolvedValueOnce(null);

      const result = await userController.updateUser({ id: userId, updateData });

      expect(userService.updateUser).toHaveBeenCalledWith(userId, updateData);
      expect(result).toEqual({
        message: 'User Not Found',
        status: HttpStatus.NOT_FOUND,
        errors: ['User Not Found'],
        data: null,
      });
    });

    it('should return an error response if an exception occurs', async () => {
      jest.spyOn(userService, 'updateUser').mockRejectedValueOnce(new Error('Some error'));

      const result = await userController.updateUser({ id: userId, updateData });

      expect(userService.updateUser).toHaveBeenCalledWith(userId, updateData);
      expect(result).toEqual({
        message: 'Could Not Complete The Operation',
        status: HttpStatus.BAD_REQUEST,
        errors: ['Could Not Complete The Operation'],
        data: null,
      });
    });
  });

  describe('deleteUser', () => {
    const userId = 'user-id-1';
    const user = new UserEntity(
      userId,
      'John Doe',
      "test@example.com",
      'pass1234',
      '123 Main St',
      '1234567890',
      ['USER'],
      true,
      1
    )
    it('should delete a user successfully', async () => {
      // Arrange
      const deleteSpy = jest.spyOn(userService, 'deleteUser').mockImplementation(() => Promise.resolve(user));
      const emitSpy = jest.spyOn(natsClient, 'emit');
      const eventData: IUserDeletedEvent = {
        subject: Subjects.UserDeleted,
        data: user.toObject()
      }

      // Act
      await userController.deleteUser({ id: userId });

      // Assert
      expect(deleteSpy).toHaveBeenCalledWith(userId);
      expect(emitSpy).toHaveBeenCalledWith(Subjects.UserDeleted, eventData)
    });

    it('should return not found error if user does not exist', async () => {
      // Arrange
      const userId = 'user-id-1';
      jest.spyOn(userService, 'deleteUser').mockResolvedValueOnce(null)

      const expectedResult = {
        message: "User Not Found",
        status: HttpStatus.NOT_FOUND,
        errors: ['User Not Found'],
        data: null
      }

      // Act & Assert
      const result = await userController.deleteUser({ id: userId })
      await expect(result).toEqual(expectedResult);
    });
  });

  describe('toggleActivation', () => {
    const userId = 'user-id-1';
    const user = new UserEntity(
      userId,
      'John Doe',
      "test@example.com",
      'pass1234',
      '123 Main St',
      '1234567890',
      ['USER'],
      true,
      1
    )
    it('should toggle user activation successfully', async () => {
      // Arrange
      const toggleSpy = jest.spyOn(userService, 'toggleUserIsActive').mockImplementation(() => Promise.resolve(user));

      // Act
      await userController.toggleActivation({ id: userId });

      // Assert
      expect(toggleSpy).toHaveBeenCalledWith(userId);
    });

    it('should return null if user does not exist', async () => {
      // Arrange
      jest.spyOn(userService, 'toggleUserIsActive').mockImplementation(() => {
        return null;
      });

      // Act & Assert
      const result = await userController.toggleActivation({ id: userId });

      expect(result).toEqual({
        message: "User Not Found",
        status: HttpStatus.NOT_FOUND,
        errors: ['User Not Found'],
        data: null
      })
    });
  });


  describe('verifyUser', () => {
    const userId = 'user-id';
    const verificationCode = '123456';

    const user = new UserEntity(
      userId,
      'John Doe',
      "test@example.com",
      'pass1234',
      '123 Main St',
      '1234567890',
      ['User'],
      true,
      1
    )


    const verifyResponse: IUserResponse = {
      message: 'User Verified',
      status: HttpStatus.OK,
      errors: null,
      data: user.toObject()
      ,
    };

    it('should verify the user and return success response', async () => {
      jest.spyOn(userService, 'verifyUser').mockResolvedValueOnce(Promise.resolve(user));

      const result = await userController.verifyUser({ token: verificationCode, roles: ['User'] });

      expect(userService.verifyUser).toHaveBeenCalledWith(verificationCode, ['User']);

      expect(result).toEqual(verifyResponse);
    });

    it('should return an error response if user verification fails', async () => {
      jest.spyOn(userService, 'verifyUser').mockResolvedValueOnce(null);

      const result = await userController.verifyUser({ token: verificationCode, roles: ['User'] });

      expect(userService.verifyUser).toHaveBeenCalledWith(verificationCode, ['User']);
      expect(result).toEqual({
        message: 'Could Not Verify The User',
        status: HttpStatus.BAD_REQUEST,
        errors: ['Could Not Verify The User'],
        data: null,
      });
    });

    it('should return an error response if an exception occurs', async () => {
      jest.spyOn(userService, 'verifyUser').mockRejectedValueOnce(new Error('Some error'));

      const result = await userController.verifyUser({ token: verificationCode, roles: ['User'] });

      expect(userService.verifyUser).toHaveBeenCalledWith(verificationCode, ['User']);
      expect(result).toEqual({
        message: 'Could Not Complete The Operation',
        status: HttpStatus.BAD_REQUEST,
        errors: ['Could Not Complete The Operation'],
        data: null,
      });
    });

    it('should return unauthorized if the user does not required roles', async () => {
      jest.spyOn(userService, 'verifyUser').mockResolvedValueOnce(Promise.resolve(user));

      const result = await userController.verifyUser({ token: verificationCode, roles: ['Admin'] });

      const expectedResult = {
        message: "Could Not Authorized The User",
        status: HttpStatus.UNAUTHORIZED,
        errors: ['Could Not Authorized The User'],
        data: null
      }

      expect(userService.verifyUser).toHaveBeenCalledWith(verificationCode, ['Admin']);
      expect(result).toEqual(expectedResult)
    })

  });

  describe('when makeUserAdmin is called', () => {

    const user = new UserEntity(
      '1',
      'John Smith',
      'john@example.com',
      'password',
      '123 Main St',
      '123-456-7890',
      [ROLE_ENUM.USER],
      true,
      1
    );
    const updatedUser = new UserEntity(
      '1',
      'John Smith',
      'john@example.com',
      'password',
      '123 Main St',
      '123-456-7890',
      [ROLE_ENUM.USER, ROLE_ENUM.ADMIN],
      true,
      1
    );


    it('should return the updated user with admin role', async () => {
      jest.spyOn(userService, 'makeUserAdmin').mockResolvedValueOnce(Promise.resolve(updatedUser));
      const emitSpy = jest.spyOn(natsClient, 'emit');

      const eventData: IUserToAdminEvent = {
        subject: Subjects.UserToAdmin,
        data: {
          id: user.getId(),
          version: user.getVersion().getValue()
        }
      }

      const result = await userController.makeUserAdmin({ id: '1' });

      expect(result.status).toEqual(HttpStatus.OK);
      expect(result.data.roles).toContain(ROLE_ENUM.ADMIN)

      expect(emitSpy).toHaveBeenCalledWith(Subjects.UserToAdmin, eventData)
    });

    it('should return null if user with given id does not exist', async () => {
      jest.spyOn(userService, 'makeUserAdmin').mockResolvedValueOnce(Promise.resolve(null));
      const expectedResult = {
        message: "Could Not Find The User",
        status: HttpStatus.BAD_REQUEST,
        errors: ['Could Not Find The User'],
        data: null
      }
      const result = await userController.makeUserAdmin({ id: '2' });
      expect(result).toEqual(expectedResult);
    });
  });
  describe('when removeAdminFromUser is called', () => {

    const user = new UserEntity(
      '1',
      'John Smith',
      'john@example.com',
      'password',
      '123 Main St',
      '123-456-7890',
      [ROLE_ENUM.USER, ROLE_ENUM.ADMIN],
      true,
      1
    );
    const updatedUser = new UserEntity(
      '1',
      'John Smith',
      'john@example.com',
      'password',
      '123 Main St',
      '123-456-7890',
      [ROLE_ENUM.USER],
      true,
      1
    );


    it('should return the updated user with admin role', async () => {
      jest.spyOn(userService, 'removeAdminRoleFromUser').mockResolvedValueOnce(Promise.resolve(updatedUser));
      const emitSpy = jest.spyOn(natsClient, 'emit');

      const eventData: IAdminToUserEvent = {
        subject: Subjects.AdminToUser,
        data: {
          id: user.getId(),
          version: user.getVersion().getValue()
        }
      }

      const result = await userController.removeAdminRoleFromUser({ id: '1' });

      expect(result.status).toEqual(HttpStatus.OK);
      expect(result.data.roles).not.toContain(ROLE_ENUM.ADMIN)

      expect(emitSpy).toHaveBeenCalledWith(Subjects.AdminToUser, eventData)
    });

    it('should return null if user with given id does not exist', async () => {
      jest.spyOn(userService, 'removeAdminRoleFromUser').mockResolvedValueOnce(Promise.resolve(null));
      const expectedResult = {
        message: "Could Not Find The User",
        status: HttpStatus.BAD_REQUEST,
        errors: ['Could Not Find The User'],
        data: null
      }
      const result = await userController.removeAdminRoleFromUser({ id: '2' });
      expect(result).toEqual(expectedResult);
    });
  });


});
