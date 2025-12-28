import { Test, TestingModule } from '@nestjs/testing';
import { SavedJobsController } from './saved-jobs.controller';

describe('SavedJobsController', () => {
  let controller: SavedJobsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavedJobsController],
    }).compile();

    controller = module.get<SavedJobsController>(SavedJobsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
