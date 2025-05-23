import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { SignInDto } from '../src/auth/dto/signin.dto';
import { UserSignUpDto } from '../src/auth/dto/user-signup.dto';
import { OrganiserSignUpDto } from '../src/auth/dto/organiser-signup.dto';
import { CreateEventDto, UpdateEventDto } from '../src/event/dto';

/**
 * @group event
 * @depends app
 */
describe('Event (e2e)', () => {
  let app: INestApplication;
  let customerToken = '';
  let organiserToken = '';
  let id = '';

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.setGlobalPrefix('/api/v1');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Auth', () => {
    describe('Signup', () => {
      // testing for customer signup
      it('(POST) => Should register a new customer', () => {
        const customer: UserSignUpDto = {
          name: 'E2E Test2',
          email: 'test2@gmail.com',
          password: '12345678',
          phone_number: '',
          address: '',
        };
        return request(app.getHttpServer())
          .post('/api/v1/auth/signup/customer')
          .send(customer)
          .expect(201);
      });

      // testing for organiser signup
      it('(POST) => Should register a new organiser', () => {
        const organiser: OrganiserSignUpDto = {
          name: 'E2E Organiser1',
          email: 'organiser2@gmail.com',
          password: '12345678',
          address: '12B Cresent Maryland',
          business_name: 'Mr Bigs',
          business_category: 'Hospitality',
          registration_number: 's#kA6uA1LkTt[5P',
          phone_number: '080123456789',
          website_url: 'https://xample.co.uk',
          facebook_url: 'https://facebook.com/xample-co-uk',
        };
        return request(app.getHttpServer())
          .post('/api/v1/auth/signup/organiser')
          .send(organiser)
          .expect(201);
      });
    });

    describe('Signin', () => {
      // testing for customer login
      test('(POST) => Should login for customer', () => {
        const customer: SignInDto = {
          email: 'test2@gmail.com',
          password: '12345678',
        };
        return request(app.getHttpServer())
          .post('/api/v1/auth/signin/customer')
          .send(customer)
          .expect(200)
          .then((res) => {
            expect(res.body.access_token).toBeDefined();
            customerToken = res.body.access_token;
          });
      });

      // testing for organiser login
      test('(POST) => Should login for organiser', () => {
        const organiser: SignInDto = {
          email: 'organiser2@gmail.com',
          password: '12345678',
        };
        return request(app.getHttpServer())
          .post('/api/v1/auth/signin/organiser')
          .send(organiser)
          .expect(200)
          .then((res) => {
            expect(res.body.access_token).toBeDefined();
            organiserToken = res.body.access_token;
          });
      });
    });
  });

  describe('Events', () => {
    describe('Create event', () => {
      const event: CreateEventDto = <any>{
        name: 'Mountain Hiking',
        description:
          'Experience the breathtaking views and fresh air while hiking through the beautiful mountain trails.',
        price: '200.0',
        address: '123 Mountain Rd, Adventure Town, AT 12345',
        total_ticket: '20',
        date: '2025-03-26',
        time: '11:30:00',
        age_range: '6-10',
        instruction: 'Parent supervision is required',
        category: 'Outing',
      };

      // testing for creating event with customer authenticated
      it('(POST) => Should not create event with customer authenticated', () => {
        return request(app.getHttpServer())
          .post('/api/v1/events')
          .set('Authorization', 'Bearer ' + customerToken)
          .send(event)
          .expect(403);
      });

      // testing for creating event with organiser authenticated
      it('(POST) => Should create event with organiser authenticated', () => {
        return request(app.getHttpServer())
          .post('/api/v1/events')
          .set('Authorization', 'Bearer ' + organiserToken)
          .send(event)
          .expect(201)
          .then((res) => expect(res.body.id).toBeDefined());
      });
    });

    describe('Get events', () => {
      // testing for finding all events with customer authenticated
      it('(GET) => Should find events with customer authentication', () => {
        return request(app.getHttpServer())
          .get('/api/v1/events')
          .set('Authorization', 'Bearer ' + customerToken)
          .expect(200)
          .then((res) => expect(res.body[0].id).toBeDefined());
      });

      // testing for finding all events with organiser authenticated
      it('(GET) => Should find events with organiser authentication', () => {
        return request(app.getHttpServer())
          .get('/api/v1/events')
          .set('Authorization', 'Bearer ' + organiserToken)
          .expect(200)
          .then((res) => {
            expect(res.body[0].id).toBeDefined();
            id = res.body[0].id;
          });
      });
    });

    describe('Get one event by ID', () => {
      // testing for finding one event with customer authenticated
      it('(GET) => Should find one event by id with customer authentication', () => {
        return request(app.getHttpServer())
          .get(`/api/v1/events/${id}`)
          .set('Authorization', 'Bearer ' + customerToken)
          .expect(200)
          .then((res) => expect(res.body.id).toBeDefined());
      });

      // testing for finding one event with organiser authenticated
      it('(GET) => Should find one event by id with organiser authentication', () => {
        return request(app.getHttpServer())
          .get(`/api/v1/events/${id}`)
          .set('Authorization', 'Bearer ' + organiserToken)
          .expect(200)
          .then((res) => expect(res.body.id).toBeDefined());
      });
    });

    describe('Update event', () => {
      const event: UpdateEventDto = { price: '50.0' };

      // testing for updating event with customer authenticated
      it('(PATCH) => Should not update event with customer authenticated', () => {
        return request(app.getHttpServer())
          .patch(`/api/v1/events/${id}`)
          .set('Authorization', 'Bearer ' + customerToken)
          .send(event)
          .expect(403);
      });

      // testing for updating event with organiser authenticated
      it('(PATCH) => Should update event with organiser authenticated', () => {
        return request(app.getHttpServer())
          .patch(`/api/v1/events/${id}`)
          .set('Authorization', 'Bearer ' + organiserToken)
          .send(event)
          .expect(202)
          .then((res) => expect(res.body.id).toBeDefined());
      });
    });

    describe('Delete event', () => {
      // testing for deleting event with customer authenticated
      it('(DELETE) => Should not delete event with customer authenticated', () => {
        return request(app.getHttpServer())
          .delete(`/api/v1/events/${id}`)
          .set('Authorization', 'Bearer ' + customerToken)
          .expect(403);
      });

      // testing for deleting event with organiser authenticated
      it('(DELETE) => Should delete event with organiser authenticated', () => {
        return request(app.getHttpServer())
          .delete(`/api/v1/events/${id}`)
          .set('Authorization', 'Bearer ' + organiserToken)
          .expect(204);
      });
    });
  });
});
