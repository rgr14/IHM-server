import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioService } from './usuario.service';
import { Usuario } from '../entities/usuario.entity';
import { Endereco } from '../entities/endereco.entity';
import { UsuarioDto } from '../dtos/usuario.dto';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let usuarioRepository: Repository<Usuario>;
  let enderecoRepository: Repository<Endereco>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioService,
        {
          provide: getRepositoryToken(Usuario),
          useClass: class MockRepository extends Repository<Usuario> {},
        },
        {
          provide: getRepositoryToken(Endereco),
          useClass: class MockRepository extends Repository<Endereco> {},
        },
      ],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);
    usuarioRepository = module.get<Repository<Usuario>>(getRepositoryToken(Usuario));
    enderecoRepository = module.get<Repository<Endereco>>(getRepositoryToken(Endereco));
  });

  describe('buscar', () => {
    it('deve chamar o método findOne do repositório com os parâmetros corretos', async () => {
      const mockFindOne = jest.fn();
      usuarioRepository.findOne = mockFindOne;

      const where = { id: 1 };
      const loadRelations = true;

      await service.buscar(where, loadRelations);

      expect(mockFindOne).toHaveBeenCalledWith({
        where,
        relations: {
          endereco: true,
        },
      });
    });
  });

  describe('buscarEmail', () => {
    it('deve chamar o método findOne do repositório com os parâmetros corretos', async () => {
      const mockFindOne = jest.fn();
      usuarioRepository.findOne = mockFindOne;

      const email = 'teste@teste.com';
      const relations = true;

      await service.buscarEmail(email, relations);

      expect(mockFindOne).toHaveBeenCalledWith({
        where: {
          email,
        },
      });
    });
  });

  describe('criar', () => {
    it('deve chamar o método findOne do repositório com os parâmetros corretos', async () => {
      const mockFindOne = jest.fn();
      usuarioRepository.findOne = mockFindOne;

      const body: UsuarioDto = {
        nomeCompleto: 'Teste Unitario',
        email: 'teste@teste.com',
        telefone: '3198625369',
        senha: '123456',
        endereco: {
            id: 1,
            endereco: 'Rua ',
            bairro: 'Bairro A',
            cidade: 'São Paulo',
            estado: 'SP',
            numero: '123',
            cep: '12345678',
        },
      };

      // Criar usuario de teste
      let user = new Usuario();
      user.id = 1;
      user.email = body.email;

      const mockSave = jest.fn().mockReturnValue(user);
      const mockSaveEndereco = jest.fn().mockReturnValue(body.endereco);
      usuarioRepository.save = mockSave;
      enderecoRepository.save = mockSaveEndereco;

      await service.criar(body);

      expect(mockFindOne).toHaveBeenCalledWith({
        where: {
          email: body.email,
        },
      });

      expect(mockSaveEndereco).toHaveBeenCalledWith(body.endereco);

      expect(mockSave).toHaveBeenCalledWith({
        ...body,
        senha: expect.any(String),
        endereco: expect.any(Object),
      });
    });
  });
});

  
