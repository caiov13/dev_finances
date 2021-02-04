const modal = {
    open(){
        //abrir modal
        // adicionar a class active ao modal
       
        document.querySelector('.modal_overlay')
        .classList.add('active')
    },

    close(){
        // fechar o mdal
        // remover a class active do modal
        
        document.querySelector('.modal_overlay')
        .classList.remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    
    set(transactions){
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
   all: Storage.get(),

   add(transaction){
        Transaction.all.push(transaction)

        app.reload()
   },

   remove(index) {
        Transaction.all.splice(index, 1)

        app.reload()
   },

    incomes(){
        //somar as entradas
        
        let income =  0
        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0) {
               
                income += transaction.amount
            }
        })
        return income
    },

    expenses(){
        //somar as saídas

        let expense =  0
        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
               
                expense += transaction.amount
            }
        })
        return expense
    },

    total(){
        // entradas - saidas
        return Transaction.incomes() + Transaction.expenses()
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data_table tbody'),

    addTransaction(transaction, index){
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)

        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {

        const CSSclass = transaction.amount > 0 ? 'income' : 'expense'

        const amount = utils.formatCurrency(transaction.amount)

        const html = `

              <td class="description">${transaction.description}</td>
              <td class="${CSSclass}">${amount}</td>
              <td class="date">${transaction.date}</td>
              <td> <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação"></td>
        `
        return html
    },

    updateBalance(){
        document.getElementById ('incomeDisplay')
        .innerHTML = utils.formatCurrency (Transaction.incomes ())

        document.getElementById('expenseDisplay')
        .innerHTML = utils.formatCurrency (Transaction.expenses ())

        document.getElementById ('totalDisplay')
        .innerHTML = utils.formatCurrency(Transaction.total ())
    },

    clearTransactions (){
        DOM.transactionsContainer.innerHTML = ''
    }
}

const utils = {
    formatAmount(value){
       value = value * 100

       return Math.round(value)
    },

    formatDate(date){
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value){
        const signal = Number(value) < 0 ? '-' : ''

        value = String(value).replace(/\D/g,'')

        value = Number(value) / 100

        value = value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        })

        return signal + value
    }
}

const form = {
    description: document.querySelector('input#description'),

    amount: document.querySelector('input#amount'),

    date: document.querySelector('input#date'),

    getValues(){
        return {
            description: form.description.value,

            amount: form.amount.value,

            date: form.date.value
        }
    },
    
    validateFields(){
        const { description, amount, date } = form.getValues()

        if (description.trim() === "" || 
        amount.trim() === "" || 
        date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues(){
        let { description, amount, date } = form.getValues()

        amount = utils.formatAmount(amount)

        date = utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        form.description.value = ""
        form.amount.value = ""
        form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try{

            // verificar se todas as informações foram preechidas
            form.validateFields()
            // formatar os dados para salvar
            const transaction = form.formatValues()
            // salvar
            Transaction.add(transaction)
            //apagar os dados do formulário
            form.clearFields()
            // modal fechar
            modal.close()
            
            // reload acontecendo no add da transaction

        } catch (error){
            alert (error.message)
        }

        
    }
}

const app = {
    init() {
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        })
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
    
    },

    reload() {
        DOM.clearTransactions()
        app.init()
    },
}

app.init()
