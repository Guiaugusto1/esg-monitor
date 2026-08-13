package br.com.unip.esgmonitor.controller;

import br.com.unip.esgmonitor.dto.MetaEsgResponseDTO;
import br.com.unip.esgmonitor.model.MetaEsg;
import br.com.unip.esgmonitor.service.MetaEsgService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/metas")
@CrossOrigin(origins = "*")
public class MetaEsgController {

    @Autowired
    private MetaEsgService metaEsgService;

    @GetMapping
    public List<MetaEsgResponseDTO> listarTodas() {
        return metaEsgService.listarTodas();
    }

    @GetMapping("/empresa/{empresaId}")
    public List<MetaEsgResponseDTO> listarPorEmpresa(@PathVariable Long empresaId) {
        return metaEsgService.listarPorEmpresa(empresaId);
    }

    @PostMapping
    public MetaEsg criar(@RequestBody MetaEsg meta) {
        return metaEsgService.salvar(meta);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        metaEsgService.deletar(id);
    }
}