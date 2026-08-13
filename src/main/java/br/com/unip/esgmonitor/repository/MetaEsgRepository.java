package br.com.unip.esgmonitor.repository;

import br.com.unip.esgmonitor.model.MetaEsg;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MetaEsgRepository extends JpaRepository<MetaEsg, Long> {

    List<MetaEsg> findByEmpresaId(Long empresaId);
}