// Dados dos projetos: fonte única para os cards da página de projetos e para as
// opções "Projetos de interesse" do cadastro. Para incluir um projeto, basta
// acrescentar um objeto aqui (e as imagens na pasta /imagens).
// Futuramente, esta lista pode vir de uma API do back-end no mesmo formato.

export const projetos = [
  {
    id: 'cozinha-solidaria',
    titulo: 'Cozinha Solidária',
    categoria: 'Alimentação',
    situacao: { texto: 'Vagas abertas', tipo: 'sucesso' },
    imagem: { arquivo: 'cozinha', alt: 'Cozinheira de máscara e avental segurando um prato de comida em frente ao fogão' },
    legenda: 'Refeição servida na Cozinha Solidária.',
    descricao: 'Oferece refeições nutritivas a famílias em situação de insegurança alimentar em Itaquera.',
    detalhes: [
      'Público: famílias cadastradas na região',
      'Frequência: de segunda a sexta, no almoço',
      'Resultado: mais de 300 refeições por dia',
    ],
  },
  {
    id: 'reforco-escolar',
    titulo: 'Reforço Escolar',
    categoria: 'Educação',
    situacao: { texto: 'Poucas vagas', tipo: 'aviso' },
    imagem: { arquivo: 'reforco', alt: 'Voluntária orientando um grupo de crianças em mesas ao ar livre' },
    legenda: 'Atividade de reforço escolar com a turma da tarde.',
    descricao: 'Aulas de apoio em português e matemática para crianças e adolescentes da rede pública.',
    detalhes: [
      'Público: estudantes de 7 a 14 anos',
      'Frequência: três vezes por semana, no contraturno escolar',
      'Resultado: 80 alunos atendidos por semestre',
    ],
  },
  {
    id: 'inclusao-digital',
    titulo: 'Inclusão Digital',
    categoria: 'Tecnologia',
    situacao: { texto: 'Aos sábados', tipo: 'neutro' },
    imagem: { arquivo: 'inclusao-digital', alt: 'Voluntário ensinando uma senhora a usar um notebook, em uma sala com outros alunos' },
    legenda: 'Aula de informática básica para adultos e idosos.',
    descricao: 'Cursos de informática básica e uso de serviços digitais para jovens, adultos e idosos.',
    detalhes: [
      'Público: jovens a partir de 16 anos, adultos e idosos',
      'Frequência: turmas aos sábados',
      'Resultado: 120 alunos certificados em 2025',
    ],
  },
];
