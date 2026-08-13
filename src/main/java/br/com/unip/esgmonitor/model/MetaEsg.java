package br.com.unip.esgmonitor.model;

import jakarta.persistence.*;

@Entity
@Table(name = "metas_esg")
public class MetaEsg {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Pilar pilar;

    @Column(nullable = false)
    private String descricao;

    @Column(nullable = false)
    private Double valorAtual;

    @Column(nullable = false)
    private Double valorMeta;

    @ManyToOne
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    public MetaEsg() {
    }

    public MetaEsg(Pilar pilar, String descricao, Double valorAtual, Double valorMeta, Empresa empresa) {
        this.pilar = pilar;
        this.descricao = descricao;
        this.valorAtual = valorAtual;
        this.valorMeta = valorMeta;
        this.empresa = empresa;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Pilar getPilar() {
        return pilar;
    }

    public void setPilar(Pilar pilar) {
        this.pilar = pilar;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Double getValorAtual() {
        return valorAtual;
    }

    public void setValorAtual(Double valorAtual) {
        this.valorAtual = valorAtual;
    }

    public Double getValorMeta() {
        return valorMeta;
    }

    public void setValorMeta(Double valorMeta) {
        this.valorMeta = valorMeta;
    }

    public Empresa getEmpresa() {
        return empresa;
    }

    public void setEmpresa(Empresa empresa) {
        this.empresa = empresa;
    }
}