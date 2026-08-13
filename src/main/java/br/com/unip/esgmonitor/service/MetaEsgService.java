package br.com.unip.esgmonitor.service;

import br.com.unip.esgmonitor.dto.MetaEsgResponseDTO;
import br.com.unip.esgmonitor.model.MetaEsg;
import br.com.unip.esgmonitor.repository.MetaEsgRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MetaEsgService {

    @Autowired
    private MetaEsgRepository metaEsgRepository;

    public List<MetaEsgResponseDTO> listarTodas() {
        return metaEsgRepository.findAll()
                .stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    public List<MetaEsgResponseDTO> listarPorEmpresa(Long empresaId) {
        return metaEsgRepository.findByEmpresaId(empresaId)
                .stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    public MetaEsg salvar(MetaEsg meta) {
        return metaEsgRepository.save(meta);
    }

    public void deletar(Long id) {
        metaEsgRepository.deleteById(id);
    }

    // Camada de analise: calcula % de progresso e classifica o desempenho
    private MetaEsgResponseDTO converterParaDTO(MetaEsg meta) {
        double percentual = 0.0;

        if (meta.getValorMeta() != 0) {
            percentual = (meta.getValorAtual() / meta.getValorMeta()) * 100.0;
        }

        // Limita a 100% no maximo para exibicao
        double percentualExibicao = Math.min(percentual, 100.0);

        String classificacao;
        if (percentual >= 80) {
            classificacao = "Alto desempenho";
        } else if (percentual >= 50) {
            classificacao = "Medio desempenho";
        } else {
            classificacao = "Baixo desempenho";
        }

        return new MetaEsgResponseDTO(
                meta.getId(),
                meta.getPilar(),
                meta.getDescricao(),
                meta.getValorAtual(),
                meta.getValorMeta(),
                percentualExibicao,
                classificacao,
                meta.getEmpresa().getNome()
        );
    }
}