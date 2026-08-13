package br.com.unip.esgmonitor.dto;

import br.com.unip.esgmonitor.model.Pilar;

public class MetaEsgResponseDTO {

    private Long id;
    private Pilar pilar;
    private String descricao;
    private Double valorAtual;
    private Double valorMeta;
    private Double percentualAtingido;
    private String classificacao;
    private String nomeEmpresa;

    public MetaEsgResponseDTO(Long id, Pilar pilar, String descricao, Double valorAtual,
                              Double valorMeta, Double percentualAtingido,
                              String classificacao, String nomeEmpresa) {
        this.id = id;
        this.pilar = pilar;
        this.descricao = descricao;
        this.valorAtual = valorAtual;
        this.valorMeta = valorMeta;
        this.percentualAtingido = percentualAtingido;
        this.classificacao = classificacao;
        this.nomeEmpresa = nomeEmpresa;
    }

    public Long getId() {
        return id;
    }

    public Pilar getPilar() {
        return pilar;
    }

    public String getDescricao() {
        return descricao;
    }

    public Double getValorAtual() {
        return valorAtual;
    }

    public Double getValorMeta() {
        return valorMeta;
    }

    public Double getPercentualAtingido() {
        return percentualAtingido;
    }

    public String getClassificacao() {
        return classificacao;
    }

    public String getNomeEmpresa() {
        return nomeEmpresa;
    }
}