
import React from 'react';
import { Page, ContentType, FaqItem } from '../types';
import {
  HomeIcon, BookOpenIcon, BeakerIcon, BuildingLibraryIcon,
  CurrencyDollarIcon, TruckIcon, DocumentTextIcon, CheckCircleIcon,
  QuestionMarkCircleIcon, EnvelopeIcon, UserGroupIcon, ShieldCheckIcon,
  GlobeAltIcon, BoltIcon, ArrowPathIcon, ScaleIcon, BanknotesIcon,
  ClipboardDocumentListIcon, InboxIcon, WrenchScrewdriverIcon, ChartBarIcon
} from '@heroicons/react/24/outline';

export const INITIAL_PAGES: Page[] = [
  {
    id: 'home',
    title: 'Página Inicial',
    icon: (props) => <HomeIcon {...props} />,
  },
  {
    id: 'diretrizes',
    title: 'Diretrizes da Empresa',
    icon: (props) => <BookOpenIcon {...props} />,
    children: [
      {
        id: 'etica-e-conduta',
        title: 'Ética e Conduta',
        icon: (props) => <ShieldCheckIcon {...props} />,
        content: [
          { id: 'c1', type: ContentType.H1, content: 'Ética e Conduta Profissional' },
          { id: 'c2', type: ContentType.P, content: 'Todos os colaboradores devem agir de maneira ética, respeitando os valores da empresa e as normas legais aplicáveis. As seguintes práticas devem ser observadas:' },
          { id: 'c3', type: ContentType.UL, content: [
            'Respeito no ambiente de trabalho: Promover um ambiente inclusivo, livre de discriminação, assédio ou comportamentos inadequados.',
            'Confidencialidade: Proteger informações sensíveis da empresa, clientes e parceiros.',
            'Conflitos de interesse: Evitar situações que possam comprometer a imparcialidade ou integridade profissional.'
          ]},
        ],
      },
      {
        id: 'sustentabilidade',
        title: 'Sustentabilidade',
        icon: (props) => <GlobeAltIcon {...props} />,
        content: [
          { id: 'c1', type: ContentType.H1, content: 'Sustentabilidade' },
          { id: 'c2', type: ContentType.P, content: 'A empresa está comprometida com práticas que minimizem impactos ambientais. Todos os colaboradores devem:'},
          { id: 'c3', type: ContentType.UL, content: [
            'Seguir corretamente os procedimentos para descarte de resíduos.',
            'Identificar oportunidades para implementar práticas sustentáveis nos processos operacionais.'
          ]},
        ],
      },
       {
        id: 'gestao-de-riscos',
        title: 'Gestão de Riscos',
        icon: (props) => <BoltIcon {...props} />,
        content: [
          { id: 'c1', type: ContentType.H1, content: 'Gestão de Riscos' },
          { id: 'c2', type: ContentType.P, content: 'Para garantir continuidade operacional e minimizar impactos negativos, é essencial adotar práticas proativas de gestão de riscos:'},
          { id: 'c3', type: ContentType.OL, content: [
              'Identificação de riscos: Mapear possíveis cenários que possam afetar os processos da empresa (ex.: falhas no sistema, atrasos logísticos).',
              'Mitigação: Implementar medidas preventivas para reduzir a probabilidade ou impacto dos riscos identificados.',
              'Resposta a incidentes: Definir planos de ação claros para lidar com problemas inesperados (ex.: procedimentos manuais em caso de falha sistêmica).',
              'Monitoramento contínuo: Revisar regularmente os riscos e atualizar os planos conforme necessário.'
          ]},
        ],
      },
       {
        id: 'revisao-e-atualizacao',
        title: 'Revisão e Atualização',
        icon: (props) => <ArrowPathIcon {...props} />,
        content: [
          { id: 'c1', type: ContentType.H1, content: 'Revisão e Atualização' },
          { id: 'c2', type: ContentType.H2, content: 'Processo de Revisão' },
          { id: 'c3', type: ContentType.OL, content: [
            'Enviar um comunicado às unidades solicitando feedback sobre o documento atual.',
            'Analisar sugestões recebidas e identificar pontos que necessitam ajustes.',
            'Realizar reuniões com representantes das áreas impactadas para validar as alterações propostas.',
            'Publicar a versão atualizada do documento e comunicar oficialmente a todos os colaboradores.'
          ]},
        ],
      },
    ],
  },
  {
    id: 'faturamento',
    title: 'Faturamento',
    icon: (props) => <ScaleIcon {...props} />,
    children: [
      { id: 'pedido-venda', title: 'Pedido de Venda', icon: (props) => <ClipboardDocumentListIcon {...props} />, content: [
          {id: 'fv1', type: ContentType.H1, content: 'Pedido de Venda'},
          {id: 'fv2', type: ContentType.P, content: 'O pedido de venda é o registro formal de uma solicitação feita por um cliente. É fundamental para garantir que os produtos ou serviços sejam fornecidos de acordo com as condições acordadas.'},
          {id: 'fv3', type: ContentType.H2, content: 'Campos Principais para Cadastro'},
          {id: 'fv4', type: ContentType.UL, content: [
            'Empresa e Filial: Indique a responsável pela emissão da nota fiscal.',
            'Cliente: Selecione o cliente.',
            'Produto e Quantidade: Informe o produto solicitado e a quantidade desejada.',
            'Preço Unitário: Insira o valor unitário do produto.',
            'Condições de Pagamento: Defina conforme acordado com o cliente.',
            'Frete: Informe o valor e se será embutido no preço.'
          ]}
      ]},
      { id: 'emissao-notas', title: 'Emissão de Notas Fiscais', icon: (props) => <DocumentTextIcon {...props} />, content: [
        {id: 'en1', type: ContentType.H1, content: 'Emissão de Notas Fiscais'},
        {id: 'en2', type: ContentType.P, content: 'A emissão de notas fiscais integra informações do pedido de compra com as ordens de carga (O.C).'},
        {id: 'en3', type: ContentType.ALERT_WARNING, content: 'Qualquer pedido criado de forma incorreta poderá gerar erros nas etapas subsequentes, resultando em inconsistências no faturamento.'},
      ]}
    ]
  },
  {
    id: 'movimento-diario',
    title: 'Movimento Diário',
    icon: (props) => <ChartBarIcon {...props} />,
    children: [
       { id: 'conferencia-movimento', title: 'Conferência de Movimento', icon: (props) => <CheckCircleIcon {...props} />, content: [
         {id: 'md1', type: ContentType.H1, content: 'Conferência de Movimento Diário'},
         {id: 'md2', type: ContentType.P, content: 'A conferência é realizada por meio de um relatório analítico que lista todas as notas emitidas no dia anterior. A equipe verifica os seguintes pontos principais:'},
         {id: 'md3', type: ContentType.UL, content: ['Alíquota de ICMS', 'Base de cálculo do ICMS', 'Tipo de frete', 'Dados adicionais obrigatórios']}
       ]},
    ]
  },
  {
    id: 'financeiro',
    title: 'Financeiro',
    icon: (props) => <CurrencyDollarIcon {...props} />,
    children: [
       { id: 'contas-receber', title: 'Contas a Receber', icon: (props) => <BanknotesIcon {...props} />, content: [
         {id: 'fr1', type: ContentType.H1, content: 'Contas a Receber'},
         {id: 'fr2', type: ContentType.H2, content: 'Passo a Passo'},
         {id: 'fr3', type: ContentType.OL, content: [
          'Organização do Controle de clientes (Carteira)',
          'Acompanhamento Regular',
          'Cobrança de Clientes Inadimplentes',
          'Registro Formal dos Pagamentos'
         ]}
       ]},
    ]
  },
  {
    id: 'logistica',
    title: 'Logística',
    icon: (props) => <TruckIcon {...props} />,
    children: [
       { id: 'fechamento-frete', title: 'Fechamento de Frete', icon: (props) => <WrenchScrewdriverIcon {...props} />, content: [
         {id: 'lg1', type: ContentType.H1, content: 'Fechamento de Frete (Terceiro)'},
         {id: 'lg2', type: ContentType.P, content: 'Processo essencial para garantir a correta apuração dos custos logísticos e a precisão nos relatórios financeiros.'},
         {id: 'lg3', type: ContentType.ALERT_INFO, content: 'Fórmula: Tonelada × Distancia em KM × Valor pago por KM.'},
       ]},
    ]
  },
  {
    id: 'lancadoria',
    title: 'Lançadoria',
    icon: (props) => <BuildingLibraryIcon {...props} />,
    children: [
       { id: 'acompanhamento-docs', title: 'Acompanhamento de Documentos', icon: (props) => <InboxIcon {...props} />, content: [
         {id: 'lc1', type: ContentType.H1, content: 'Acompanhamento de Documentos Fiscais'},
         {id: 'lc2', type: ContentType.P, content: 'A área de lançadoria é responsável pelo acompanhamento, conferência e lançamento de documentos fiscais no sistema, garantindo a correta alocação de despesas.'}
       ]},
    ]
  },
  {
    id: 'checklist-rotinas',
    title: 'Checklist e Rotinas',
    icon: (props) => <CheckCircleIcon {...props} />,
    children: [
       { id: 'dist-demandas', title: 'Distribuição de Demandas', icon: (props) => <UserGroupIcon {...props} />, content: [
        {id: 'cr1', type: ContentType.H1, content: 'Distribuição das Demandas'},
        {id: 'cr2', type: ContentType.P, content: 'Dividir tarefas entre os membros da equipe conforme o volume diário.'},
        {id: 'cr3', type: ContentType.UL, content: [
            'Unidades com alta demanda: Distribuir tarefas entre os colaboradores.',
            'Unidades com baixa demanda: Centralizar o processo em um colaborador específico, mantendo os demais preparados para auxiliar quando necessário.'
        ]}
       ]},
       { id: 'responsabilidades', title: 'Responsabilidades', icon: (props) => <UserGroupIcon {...props} />, content: [
        {id: 'cr4', type: ContentType.H1, content: 'Responsabilidades'},
        {id: 'cr5', type: ContentType.H2, content: 'Equipe Compartilhada'},
        {id: 'cr6', type: ContentType.P, content: 'Toda a equipe deve estar apta a realizar lançamentos, garantindo flexibilidade operacional em casos de alta demanda ou ausência temporária de algum colaborador.'}
       ]},
    ]
  },
  {
    id: 'faq',
    title: 'FAQ',
    icon: (props) => <QuestionMarkCircleIcon {...props} />,
  },
  {
    id: 'contato',
    title: 'Contato',
    icon: (props) => <EnvelopeIcon {...props} />,
  },
];


export const INITIAL_FAQS: FaqItem[] = [
  {
    id: 'faq1',
    question: 'Como faço para cadastrar um novo cliente?',
    answer: 'Para cadastrar um novo cliente, acesse a seção de Faturamento > Pedido de Venda e siga as instruções para preenchimento dos dados do cliente. Certifique-se de ter todos os documentos necessários em mãos.',
  },
  {
    id: 'faq2',
    question: 'O que fazer em caso de falha no sistema durante a emissão de uma nota fiscal?',
    answer: 'Consulte a seção "Procedimento em Caso de Oscilação da Internet" na página de Emissão de Notas Fiscais. O procedimento padrão é registrar os dados em uma planilha e emitir a nota manualmente, para posterior inserção no sistema pelo T.I.',
  },
  {
    id: 'faq3',
    question: 'Qual é a política para descarte de resíduos de escritório?',
    answer: 'A política de descarte está detalhada na seção de Sustentabilidade. Resumidamente, separe o lixo orgânico do reciclável e utilize os coletores específicos para cada tipo de material.',
  },
];
